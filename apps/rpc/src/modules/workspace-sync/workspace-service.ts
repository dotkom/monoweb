import type { DBHandle } from "@dotkomonline/db"
import { getLogger } from "@dotkomonline/logger"
import type { Group, GroupId, GroupMember, User, UserId } from "@dotkomonline/types"
import type { admin_directory_v1 } from "googleapis"
import type { GaxiosResponseWithHTTP2 } from "googleapis-common"
import invariant from "tiny-invariant"
import type { GroupService } from "../group/group-service"
import type { UserService } from "../user/user-service"
import { getDirectory } from "./client"
import { getCommitteeEmail, getEmail, getKey, getTemporaryPassword, joinOnWorkspaceUserId } from "./helpers"
import { WorkspaceUserNotFoundError } from "./workspace-error"

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
  getWorkspaceUser(handle: DBHandle, userId: UserId): Promise<admin_directory_v1.Schema$User>
  findWorkspaceUser(handle: DBHandle, userId: UserId): Promise<admin_directory_v1.Schema$User | null>

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

export function getWorkspaceService(userService: UserService, groupService: GroupService): WorkspaceService {
  const logger = getLogger("workspace-sync-service")

  const createRecoveryCodes = async (user: User): Promise<string[] | null> => {
    const directory = getDirectory()

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
      const directory = getDirectory()

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

    async getWorkspaceUser(handle, userId) {
      const directory = getDirectory()

      const user = await userService.getById(handle, userId)

      const response = await directory.users.get({
        userKey: getKey(user),
      })

      if (response.status === 404) {
        throw new WorkspaceUserNotFoundError(getKey(user))
      }

      if (response.status !== 200) {
        logger.warn("Failed to fetch user from workspace")
        throw new Error()
      }

      invariant(response.data, "Expected response data to be defined")

      return response.data
    },

    async findWorkspaceUser(handle, userId) {
      const directory = getDirectory()

      const user = await userService.getById(handle, userId)

      const response = await directory.users.get({
        userKey: getKey(user),
      })

      if (response.status === 404) {
        return null
      }

      if (response.status !== 200) {
        logger.warn("Failed to fetch user from workspace")
        throw new Error()
      }

      invariant(response.data, "Expected response data to be defined")

      return response.data
    },

    async resetWorkspaceUserPassword(handle, userId) {
      const directory = getDirectory()

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
      const directory = getDirectory()

      const group = await groupService.getById(handle, groupSlug)
      const user = await userService.getById(handle, userId)

      const res = await directory.members.insert({
        groupKey: getKey(group),
        requestBody: {
          email: getEmail(user),
          role: "MEMBER",
        },
      })

      invariant(res.data, "Expected response data to be defined")

      return res.data
    },

    async removeUserFromWorkspaceGroup(handle, groupId, userId) {
      const directory = getDirectory()

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

      const directory = getDirectory()

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
      const directory = getDirectory()

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

      invariant(response.data, "Expected response data to be defined")

      return response.data
    },

    async getMembersForGroup(handle, groupId) {
      const directory = getDirectory()

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

        invariant(response.data, "Expected response data to be defined")
        invariant(response.data.members, "Expected response data to be defined")

        const users = await groupService.getMembers(handle, group.slug)

        workspaceMembers.push(...joinOnWorkspaceUserId([...users.values()], response.data.members))

        pageToken = response.data.nextPageToken ?? undefined
      } while (pageToken !== undefined)

      return workspaceMembers
    },

    async getWorkspaceGroupsForWorkspaceUser(handle, userId) {
      const directory = getDirectory()

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
