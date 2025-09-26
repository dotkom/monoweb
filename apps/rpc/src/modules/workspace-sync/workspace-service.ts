import { randomBytes } from "node:crypto"
import type { DBHandle } from "@dotkomonline/db"
import { getLogger } from "@dotkomonline/logger"
import type { Group, GroupId, GroupMember, User, UserId } from "@dotkomonline/types"
import { slugify } from "@dotkomonline/utils"
import type { admin_directory_v1 } from "googleapis"
import { GaxiosError, type GaxiosResponseWithHTTP2 } from "googleapis-common"
import invariant from "tiny-invariant"
import { configuration, isGoogleWorkspaceFeatureEnabled } from "../../configuration"
import { IllegalStateError, NotFoundError } from "../../error"
import type { GroupService } from "../group/group-service"
import type { UserService } from "../user/user-service"

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
    workspaceUser: admin_directory_v1.Schema$User
    recoveryCodes: string[] | null
    password: string
  }>
  resetWorkspaceUserPassword(
    handle: DBHandle,
    userId: UserId
  ): Promise<{
    user: User
    workspaceUser: admin_directory_v1.Schema$User
    recoveryCodes: string[] | null
    password: string
  }>
  findWorkspaceUser(handle: DBHandle, userId: UserId): Promise<admin_directory_v1.Schema$User | null>
  getWorkspaceUser(handle: DBHandle, userId: UserId): Promise<admin_directory_v1.Schema$User>

  // Groups
  createWorkspaceGroup(
    handle: DBHandle,
    groupSlug: GroupId
  ): Promise<{ group: Group; workspaceGroup: admin_directory_v1.Schema$Group }>
  findWorkspaceGroup(handle: DBHandle, groupSlug: GroupId): Promise<admin_directory_v1.Schema$Group | null>
  addUserIntoWorkspaceGroup(
    handle: DBHandle,
    groupSlug: GroupId,
    userId: UserId
  ): Promise<admin_directory_v1.Schema$Member>
  removeUserFromWorkspaceGroup(handle: DBHandle, groupSlug: GroupId, userId: UserId): Promise<boolean>
  getMembersForGroup(
    handle: DBHandle,
    groupSlug: GroupId
  ): Promise<{ groupMember: GroupMember | null; workspaceMember: admin_directory_v1.Schema$Member | null }[]>
  getWorkspaceGroupsForWorkspaceUser(
    handle: DBHandle,
    userId: UserId
  ): Promise<{ group: Group; workspaceGroup: admin_directory_v1.Schema$Group }[]>
}

export function getWorkspaceService(
  directory: admin_directory_v1.Admin | null,
  userService: UserService,
  groupService: GroupService
): WorkspaceService {
  if (!isGoogleWorkspaceFeatureEnabled(configuration)) {
    throw new IllegalStateError("Google Workspace integration is not enabled")
  }
  if (!directory) {
    throw new IllegalStateError("Google Workspace directory could not be initialized")
  }

  const logger = getLogger("workspace-sync-service")

  const createRecoveryCodes = async (user: User): Promise<string[] | null> => {
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

    async findWorkspaceUser(handle, userId) {
      const user = await userService.getById(handle, userId)
      const keys = getKeys(user)

      let workspaceUser: admin_directory_v1.Schema$User | null = null

      for (const key of keys) {
        let response: GaxiosResponseWithHTTP2<admin_directory_v1.Schema$User> | null

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

    async getWorkspaceUser(handle, userId) {
      const workspaceUser = await this.findWorkspaceUser(handle, userId)

      if (!workspaceUser) {
        throw new NotFoundError(`Workspace User for UserID(${userId}) not found`)
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

      const res = await directory.members.insert({
        groupKey: getKey(group),
        requestBody: {
          email: getEmail(user),
          role: "MEMBER",
        },
      })

      return res.data
    },

    async removeUserFromWorkspaceGroup(handle, groupId, userId) {
      const group = await groupService.getById(handle, groupId)
      const user = await userService.getById(handle, userId)

      return await directory.members
        .delete({
          groupKey: getKey(group),
          memberKey: getKey(user),
        })
        .then(() => true)
        .catch(() => false)
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

    async findWorkspaceGroup(handle, groupId) {
      const group = await groupService.getById(handle, groupId)

      const response = await directory.groups.get({
        groupKey: group.workspaceGroupId ?? getKey(group),
      })

      if (response.status === 404) {
        return null
      }

      if (response.status !== 200) {
        logger.warn("Failed to fetch group from workspace")
        throw new Error()
      }

      return response.data
    },

    async getMembersForGroup(handle, groupId) {
      const group = await groupService.getById(handle, groupId)

      const workspaceMembers: {
        groupMember: GroupMember | null
        workspaceMember: admin_directory_v1.Schema$Member | null
      }[] = []

      let pageToken: string | undefined = undefined

      do {
        const response: GaxiosResponseWithHTTP2<admin_directory_v1.Schema$Members> = await directory.members.list({
          groupKey: group.workspaceGroupId ?? getKey(group),
          pageToken: pageToken,
        })

        invariant(response.data.members, "Expected response data to be defined")

        const users = await groupService.getMembers(handle, group.slug)

        workspaceMembers.push(...joinOnWorkspaceUserId([...users.values()], response.data.members))

        pageToken = response.data.nextPageToken ?? undefined
      } while (pageToken !== undefined)

      return workspaceMembers
    },

    async getWorkspaceGroupsForWorkspaceUser(handle, userId) {
      const user = await userService.getById(handle, userId)

      const groups: { group: Group; workspaceGroup: admin_directory_v1.Schema$Group }[] = []
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
  }
}

const getLocal = (localResolvable: User | Group | string): string => {
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

/**
 * @example
 * getEmail("user") // "user@online.ntnu.no"
 * getEmail("user@online.ntnu.no") // "user@online.ntnu.no"
 * getEmail("user", "custom.domain") // "user@custom.domain"
 */
const getEmail = (localResolvable: User | Group | string, domain = configuration.googleWorkspace.domain): string => {
  const local = getLocal(localResolvable)

  if (local.includes("@")) {
    return local
  }

  return `${local}@${domain}`
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
const getKey = (localResolvable: User | Group | string, domain = configuration.googleWorkspace.domain): string => {
  if (typeof localResolvable === "object") {
    if ("workspaceUserId" in localResolvable && localResolvable.workspaceUserId) {
      return localResolvable.workspaceUserId
    }

    if ("workspaceGroupId" in localResolvable && localResolvable.workspaceGroupId) {
      return localResolvable.workspaceGroupId
    }
  }

  return getEmail(localResolvable, domain)
}

const getKeys = (localResolvable: User | Group | string, domain = configuration.googleWorkspace.domain): string[] => {
  const keys = new Set<string>()

  const baseKey = getKey(localResolvable, domain)

  // In older versions of OnlineWeb, all dashes (-) were removed from the email local part.
  // We add this to the set of keys to attempt to find an account created by the older version.
  keys.add(baseKey)
  keys.add(baseKey.replace("-", ""))

  const names = getLocal(localResolvable).split(".").filter(Boolean)

  // In older version of OnlineWeb, it was less common to have your full name on your profile.
  // A lot of older accounts were generated with only first name and last name, so we attempt to
  // find those accounts as well.
  if (names.length > 2) {
    keys.add(getEmail(`${names[0]} ${names.at(-1)}`, domain))
    keys.add(getEmail(`${names[0]} ${names.at(-1)}`.replace("-", ""), domain))
  }

  return [...keys]
}

const getTemporaryPassword = () => {
  return randomBytes(TEMPORARY_PASSWORD_LENGTH).toString("base64").slice(0, TEMPORARY_PASSWORD_LENGTH)
}

const getCommitteeEmail = (fullName: string) => {
  if (!fullName.trim()) {
    throw new Error("Invalid full name")
  }

  return getKey(slugify(fullName, SLUGIFY_OPTIONS))
}

type UserAndWorkspaceMember = {
  groupMember: GroupMember | null
  workspaceMember: admin_directory_v1.Schema$Member | null
}

const joinOnWorkspaceUserId = (
  groupMembers: GroupMember[],
  workspaceUsers: admin_directory_v1.Schema$Member[]
): UserAndWorkspaceMember[] => {
  const rightJoin: UserAndWorkspaceMember[] = []
  const leftJoin = new Map<string, UserAndWorkspaceMember>()

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
