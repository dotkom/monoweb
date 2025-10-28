import { randomBytes } from "node:crypto"
import type { DBHandle } from "@dotkomonline/db"
import { getLogger } from "@dotkomonline/logger"
import {
  type Group,
  type GroupId,
  type GroupMember,
  type User,
  type UserId,
  type WorkspaceGroup,
  type WorkspaceGroupLink,
  type WorkspaceMember,
  type WorkspaceMemberLink,
  type WorkspaceMemberSyncState,
  type WorkspaceUser,
  getActiveGroupMembership,
} from "@dotkomonline/types"
import { slugify } from "@dotkomonline/utils"
import { isAfter } from "date-fns"
import type { admin_directory_v1 } from "googleapis"
import { GaxiosError, type GaxiosResponseWithHTTP2 } from "googleapis-common"
import invariant from "tiny-invariant"
import type { ConfigurationWithGoogleWorkspace } from "../../configuration"
import { NotFoundError } from "../../error"
import type { GroupService } from "../group/group-service"
import type { UserService } from "../user/user-service"
import { TZDate } from "@date-fns/tz"

// Google Workspace enforces a minimum password length of 8 characters
const TEMPORARY_PASSWORD_LENGTH = 8

const SLUGIFY_OPTIONS = {
  replacement: ".",
  strict: false,
  remove: /[^a-zA-Z0-9-\s]/g,
}

export interface WorkspaceService {
  // User
  createWorkspaceUser(
    handle: DBHandle,
    userId: UserId
  ): Promise<{
    user: User
    workspaceUser: WorkspaceUser
    recoveryCodes: string[] | null
    password: string
  }>
  resetWorkspaceUserPassword(
    handle: DBHandle,
    userId: UserId
  ): Promise<{
    user: User
    workspaceUser: WorkspaceUser
    recoveryCodes: string[] | null
    password: string
  }>
  findWorkspaceUser(handle: DBHandle, userId: UserId, customKey?: string): Promise<WorkspaceUser | null>
  getWorkspaceUser(handle: DBHandle, userId: UserId, customKey?: string): Promise<WorkspaceUser>

  // Groups
  createWorkspaceGroup(handle: DBHandle, groupSlug: GroupId): Promise<WorkspaceGroupLink>
  findWorkspaceGroup(handle: DBHandle, groupSlug: GroupId, customKey?: string): Promise<WorkspaceGroup | null>
  getWorkspaceGroup(handle: DBHandle, groupSlug: GroupId, customKey?: string): Promise<WorkspaceGroup>
  addUserIntoWorkspaceGroup(handle: DBHandle, groupSlug: GroupId, userId: UserId): Promise<WorkspaceMember>
  removeUserFromWorkspaceGroup(handle: DBHandle, groupSlug: GroupId, userId: UserId): Promise<boolean>
  getMembersForGroup(handle: DBHandle, groupSlug: GroupId): Promise<WorkspaceMemberLink[]>
  getWorkspaceGroupsForWorkspaceUser(handle: DBHandle, userId: UserId): Promise<WorkspaceGroupLink[]>
  synchronizeWorkspaceGroup(handle: DBHandle, groupSlug: GroupId): Promise<boolean>
}

export function getWorkspaceService(
  directory: admin_directory_v1.Admin,
  userService: UserService,
  groupService: GroupService,
  configuration: ConfigurationWithGoogleWorkspace
): WorkspaceService {
  const logger = getLogger("workspace-sync-service")

  logger.info("Using Google Workspace integration against Domain=%s", configuration.googleWorkspace.domain)

  function joinGroupAndWorkspaceMembers(
    groupMembers: GroupMember[],
    workspaceUsers: WorkspaceMember[]
  ): Omit<WorkspaceMemberLink, "syncState">[] {
    const rightJoin: Omit<WorkspaceMemberLink, "syncState">[] = []
    const leftJoin = new Map<string, Omit<WorkspaceMemberLink, "syncState">>()

    for (const workspaceMember of workspaceUsers) {
      invariant(workspaceMember.id, "Workspace member must have an ID")

      // Duplicate in the argument, not from Google
      if (leftJoin.get(workspaceMember.id)?.workspaceMember) {
        throw new Error(`Duplicate workspace member ID found: ${workspaceMember.id}`)
      }

      leftJoin.set(workspaceMember.id, { groupMember: null, workspaceMember })
    }

    for (const groupMember of groupMembers) {
      let entry = groupMember.workspaceUserId ? leftJoin.get(groupMember.workspaceUserId) : null
      entry ??= { groupMember: null, workspaceMember: null }

      // Duplicate in the argument, since workspaceUserId is unique in the database.
      if (entry.groupMember) {
        throw new Error(`Duplicate workspace user ID found: ${groupMember.workspaceUserId}`)
      }

      if (!entry.workspaceMember || !groupMember.workspaceUserId) {
        rightJoin.push({ groupMember, workspaceMember: null })
        continue
      }

      leftJoin.set(groupMember.workspaceUserId, { groupMember, workspaceMember: entry.workspaceMember })
    }

    return [...leftJoin.values()].concat(rightJoin)
  }

  async function createRecoveryCodes(user: User): Promise<string[] | null> {
    await directory.verificationCodes.generate({
      userKey: getKey(user),
    })

    const response = await directory.verificationCodes.list({
      userKey: user.workspaceUserId ?? getKey(user),
    })

    if (!response.data.items) {
      return null
    }

    return response.data.items.map((code) => code.verificationCode).filter(Boolean) as string[]
  }

  async function removeFromWorkspaceGroup(groupKey: string, memberKey: string): Promise<boolean> {
    return await directory.members
      .delete({
        groupKey,
        memberKey,
      })
      .then(() => true)
      .catch(() => false)
  }

  /**
   * @example
   * getEmail("user") // "user@online.ntnu.no"
   * getEmail("user@online.ntnu.no") // "user@online.ntnu.no"
   * getEmail("user", "custom.domain") // "user@custom.domain"
   */
  function getEmail(localResolvable: User | Group | string, domain = configuration.googleWorkspace.domain): string {
    const local = getLocal(localResolvable)

    if (local.includes("@")) {
      return local
    }

    return `${local}@${domain}`
  }

  function getLinkedWorkspaceId(workspaceIdResolvable: User | Group | string): string | null {
    if (typeof workspaceIdResolvable === "string") {
      return null
    }

    if ("workspaceUserId" in workspaceIdResolvable && workspaceIdResolvable.workspaceUserId) {
      return workspaceIdResolvable.workspaceUserId
    }

    if ("workspaceGroupId" in workspaceIdResolvable && workspaceIdResolvable.workspaceGroupId) {
      return workspaceIdResolvable.workspaceGroupId
    }

    return null
  }

  /**
   * Get a key for a user or a group.
   * A key is used to identify something in Google Workspace. It can be the objects id or an email (primary or alias).
   *
   * @example
   * getKey(user) // <Workspace id>
   * getKey(userWithoutWorkspaceId) // "full.name@online.ntnu.no"
   * getKey("Full Name") // "full.name@online.ntnu.no"
   * getKey("full.name@online.ntnu.no") // "full.name@online.ntnu.no"
   * getKey("string", "custom.domain") // "string@custom.domain"
   */
  function getKey(keyResolvable: User | Group | string, domain = configuration.googleWorkspace.domain): string {
    return getLinkedWorkspaceId(keyResolvable) ?? getEmail(keyResolvable, domain)
  }

  function getKeys(keyResolvable: User | Group | string, domain = configuration.googleWorkspace.domain): string[] {
    const linkedId = getLinkedWorkspaceId(keyResolvable)

    if (linkedId) {
      return [linkedId]
    }

    const keys = new Set<string>()

    const emailKey = getEmail(keyResolvable, domain)

    keys.add(emailKey)
    // In older versions of OnlineWeb, all dashes (-) were removed from the email local part.
    // We add this to the set of keys to attempt to find an account created by the older version.
    keys.add(emailKey.replace("-", ""))

    const names = getLocal(keyResolvable).split(".").filter(Boolean)

    // In older version of OnlineWeb it was less common to have your full name on your profile.
    // A lot of older accounts were generated with only first name and last name, so we attempt to
    // find those accounts as well.
    if (names.length > 2) {
      keys.add(getEmail(`${names[0]} ${names.at(-1)}`, domain))
      keys.add(getEmail(`${names[0]} ${names.at(-1)}`.replace("-", ""), domain))
    }

    return [...keys]
  }

  function getCommitteeEmail(fullName: string) {
    if (!fullName.trim()) {
      throw new Error("Invalid full name")
    }

    return getKey(slugify(fullName, SLUGIFY_OPTIONS))
  }

  function getLocal(localResolvable: User | Group | string): string {
    if (typeof localResolvable === "string") {
      return slugify(localResolvable, SLUGIFY_OPTIONS)
    }

    const isGroup = "type" in localResolvable

    if (isGroup) {
      return slugify(localResolvable.slug, SLUGIFY_OPTIONS)
    }

    // It is a user
    if (!localResolvable.name) {
      throw new Error("User name is required")
    }

    return slugify(localResolvable.name, SLUGIFY_OPTIONS)
  }

  function getTemporaryPassword(): string {
    return randomBytes(TEMPORARY_PASSWORD_LENGTH).toString("base64").slice(0, TEMPORARY_PASSWORD_LENGTH)
  }

  function getWorkspaceMemberSyncState(memberLink: Omit<WorkspaceMemberLink, "syncState">): WorkspaceMemberSyncState {
    // Some of the oldest users do not have Workspace accounts, and we do not want to give "Needs linking" warnings for
    // them, since it has been over a decade since their last group membership ended. We do not want to create new
    // accounts for these old users either, so we treat them as synced.

    // Some group members have their latest membership end set to 2016-01-01T00:00:00Z and do not have Workspace accounts.
    // This cutoff is chosen because everyone with their latest membership end after this date has a Workspace account.
    // January 2nd is just to be safe.
    const oldUserLastGroupMembershipCutoff = new TZDate("2016-01-02T00:00:00Z")
    const isOldUser = memberLink.groupMember?.groupMemberships.every(
      ({ end }) => end && !isAfter(end, oldUserLastGroupMembershipCutoff)
    )

    if (isOldUser) {
      return "SYNCED"
    }

    if (memberLink.groupMember && !memberLink.groupMember?.workspaceUserId) {
      return "PENDING_LINK"
    }

    const isActiveMember = getActiveGroupMembership(memberLink.groupMember) !== null
    const isInWorkspace = memberLink.workspaceMember !== null

    if (isActiveMember && !isInWorkspace) {
      return "PENDING_ADD"
    }

    if (!isActiveMember && isInWorkspace) {
      return "PENDING_REMOVE"
    }

    return "SYNCED"
  }

  return {
    async createWorkspaceUser(handle, userId) {
      const user = await userService.getById(handle, userId)

      if (user.workspaceUserId) {
        throw new Error("User already has a workspace user ID")
      }

      if (!user.name) {
        throw new Error("User name is required")
      }

      if (!user.name.includes(" ")) {
        throw new Error("User name must include a space")
      }

      const primaryEmail = getCommitteeEmail(user.name)
      const password = getTemporaryPassword()

      const firstName = user.name.split(" ").slice(0, -1).join(" ")
      const lastName = user.name.split(" ").at(-1)

      if (!firstName || !lastName) {
        throw new Error("Failed to split user name into first and last name")
      }

      const response = await directory.users.insert({
        requestBody: {
          primaryEmail,
          password,
          name: {
            givenName: firstName,
            familyName: lastName,
          },
          recoveryEmail: user.email,
          recoveryPhone: user.phone,
          changePasswordAtNextLogin: true,
        },
      })

      invariant(response.data, "Expected response data to be defined")
      invariant(response.data.id, "Expected response data to have ID")

      const newUser = await userService.update(handle, user.id, {
        workspaceUserId: response.data.id,
      })

      const is2faEnforced = response.data.isEnforcedIn2Sv ?? false
      const is2faEnabled = response.data.isEnrolledIn2Sv ?? false

      let recoveryCodes: string[] | null = null

      if (is2faEnforced && !is2faEnabled) {
        recoveryCodes = await createRecoveryCodes(user)
      }

      return {
        user: newUser,
        workspaceUser: response.data,
        recoveryCodes,
        password,
      }
    },

    async findWorkspaceUser(handle, userId, customKey) {
      const user = await userService.getById(handle, userId)
      const keys = customKey != null ? getKeys(customKey) : getKeys(user)

      let workspaceUser: WorkspaceUser | null = null

      for (const key of keys) {
        let response: GaxiosResponseWithHTTP2<WorkspaceUser> | null

        try {
          response = await directory.users.get({ userKey: key })
        } catch (error) {
          if (!(error instanceof GaxiosError)) {
            throw error
          }

          if (error.response?.status === 404) {
            continue
          }

          logger.error("Failed to fetch WorkspaceUser(Key=%s) from workspace with message: %s", key, error.message)
          throw error
        }

        if (!response) {
          continue
        }

        workspaceUser = response.data

        break
      }

      return workspaceUser
    },

    async getWorkspaceUser(handle, userId, customKey) {
      const workspaceUser = await this.findWorkspaceUser(handle, userId, customKey)

      if (!workspaceUser) {
        throw new NotFoundError(`Workspace User for User(ID=${userId}) not found`)
      }

      return workspaceUser
    },

    async resetWorkspaceUserPassword(handle, userId) {
      const user = await userService.getById(handle, userId)
      const password = getTemporaryPassword()

      const response = await directory.users.update({
        userKey: getKey(user),
        requestBody: {
          password,
          changePasswordAtNextLogin: true,
        },
      })

      invariant(response.data, "Expected response data to be defined")

      const is2faEnforced = response.data.isEnforcedIn2Sv ?? false
      const is2faEnabled = response.data.isEnrolledIn2Sv ?? false

      let recoveryCodes: string[] | null = null

      if (is2faEnforced && !is2faEnabled) {
        await directory.verificationCodes.invalidate({ userKey: getKey(user) })
        recoveryCodes = await createRecoveryCodes(user)
      }

      return {
        user,
        workspaceUser: response.data,
        recoveryCodes,
        password,
      }
    },

    async addUserIntoWorkspaceGroup(handle, groupSlug, userId) {
      const group = await groupService.getById(handle, groupSlug)
      const user = await userService.getById(handle, userId)
      const workspaceUser = await this.getWorkspaceUser(handle, userId)

      if (!workspaceUser.primaryEmail) {
        throw new NotFoundError("Workspace user does not have a primary email")
      }

      const res = await directory.members.insert({
        groupKey: getKey(group),
        requestBody: {
          email: workspaceUser.primaryEmail,
          role: "MEMBER",
        },
      })

      return res.data
    },

    async removeUserFromWorkspaceGroup(handle, groupId, userId) {
      const group = await groupService.getById(handle, groupId)
      const user = await userService.getById(handle, userId)

      return await removeFromWorkspaceGroup(getKey(group), getKey(user))
    },

    async createWorkspaceGroup(handle, groupId) {
      const group = await groupService.getById(handle, groupId)

      if (group.workspaceGroupId) {
        throw new Error("Group already has a workspace group ID")
      }

      const { data } = await directory.groups.insert({
        requestBody: {
          email: getEmail(group),
          name: group.name || group.slug,
        },
      })

      let updatedGroup = group

      if (!data.id) {
        logger.error("Failed to create group in workspace: No ID returned")
      } else {
        updatedGroup = await groupService.update(handle, group.slug, {
          workspaceGroupId: data.id,
        })
      }

      return { group: updatedGroup, workspaceGroup: data }
    },

    async findWorkspaceGroup(handle, groupId, customKey) {
      const group = await groupService.getById(handle, groupId)
      const groupKey = customKey ? getKey(customKey) : getKey(group)

      try {
        const response = await directory.groups.get({ groupKey })

        return response.data
      } catch (error) {
        if (!(error instanceof GaxiosError)) {
          throw error
        }

        if (error.response?.status === 404) {
          return null
        }

        logger.error("Failed to fetch WorkspaceGroup(Key=%s) from workspace with message: %s", groupKey, error.message)
        throw error
      }
    },

    async getWorkspaceGroup(handle, groupId, customKey) {
      const workspaceGroup = await this.findWorkspaceGroup(handle, groupId, customKey)

      if (!workspaceGroup) {
        throw new NotFoundError(`Workspace Group for Group(ID=${groupId}) not found`)
      }

      return workspaceGroup
    },

    async getMembersForGroup(handle, groupId) {
      const group = await groupService.getById(handle, groupId)

      const workspaceMembers: WorkspaceMemberLink[] = []

      let pageToken: string | undefined = undefined

      do {
        const response: GaxiosResponseWithHTTP2<admin_directory_v1.Schema$Members> = await directory.members.list({
          groupKey: group.workspaceGroupId ?? getKey(group),
          pageToken: pageToken,
        })

        invariant(response.data.members, "Expected response data to be defined")

        const members = await groupService.getMembers(handle, group.slug)

        const joinedGroupAndWorkspaceMembers = joinGroupAndWorkspaceMembers(
          [...members.values()],
          response.data.members
        )
        const workspaceMemberLink = joinedGroupAndWorkspaceMembers.map((member) => ({
          ...member,
          syncState: getWorkspaceMemberSyncState(member),
        }))

        workspaceMembers.push(...workspaceMemberLink)

        pageToken = response.data.nextPageToken ?? undefined
      } while (pageToken !== undefined)

      return workspaceMembers
    },

    async getWorkspaceGroupsForWorkspaceUser(handle, userId) {
      const user = await userService.getById(handle, userId)

      const groups: WorkspaceGroupLink[] = []
      let pageToken: string | undefined = undefined

      do {
        const { data }: GaxiosResponseWithHTTP2<admin_directory_v1.Schema$Groups> = await directory.groups.list({
          userKey: getKey(user),
          pageToken,
        })

        for (const workspaceGroup of data.groups ?? []) {
          const group = await groupService.getById(handle, workspaceGroup.email?.split("@")[0] ?? "")
          groups.push({ group, workspaceGroup })
        }

        pageToken = data.nextPageToken ?? undefined
      } while (pageToken)

      return groups
    },

    async synchronizeWorkspaceGroup(handle, groupSlug) {
      const group = await groupService.getById(handle, groupSlug)
      const members = await this.getMembersForGroup(handle, groupSlug)

      const actions = members.map(async (member) => {
        const { groupMember, workspaceMember, syncState } = member

        switch (syncState) {
          case "PENDING_LINK":
          case "SYNCED": {
            return null
          }
          case "PENDING_ADD": {
            invariant(groupMember, "Expected group member to be defined for PENDING_ADD action")
            invariant(
              groupMember.workspaceUserId,
              "Expected group member to have a workspace user ID for PENDING_ADD action"
            )

            return this.addUserIntoWorkspaceGroup(handle, groupSlug, groupMember.id)
          }
          case "PENDING_REMOVE": {
            invariant(group.workspaceGroupId, "Expected group to have a workspace group ID for PENDING_REMOVE action")
            invariant(workspaceMember?.id, "Expected workspace member to have an ID for PENDING_REMOVE action")

            return removeFromWorkspaceGroup(group.workspaceGroupId, workspaceMember.id)
          }
        }
      })

      await Promise.all(actions)

      return true
    },
  }
}
