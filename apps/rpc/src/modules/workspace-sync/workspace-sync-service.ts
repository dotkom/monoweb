import type { DBHandle } from "@dotkomonline/db"
import { getLogger } from "@dotkomonline/logger"
import type { Group, User } from "@dotkomonline/types"
import type { admin_directory_v1 } from "googleapis"
import type { GaxiosResponseWithHTTP2 } from 'googleapis-common';
import { configuration } from "src/configuration"
import invariant from "tiny-invariant"
import type { GroupService } from "../group/group-service"
import type { UserService } from "../user/user-service"
import { getDirectory } from "./client"
import { getCommitteeEmail, getKey, getTemporaryPassword, joinOnWorkspaceUserId } from "./helpers"

export interface WorkspaceSyncService {
  isSyncEnabled(): boolean

  // User
  createWorkspaceUser(
    handle: DBHandle,
    user: User
  ): Promise<{
    user: User
    workspaceUser: admin_directory_v1.Schema$User
    recoveryCodes: string[] | null
    password: string
  }>
  resetWorkspaceUserPassword(
    handle: DBHandle,
    user: User
  ): Promise<{
    user: User
    workspaceUser: admin_directory_v1.Schema$User
    recoveryCodes: string[] | null
    password: string
  }>
  findWorkspaceUser(handle: DBHandle, user: User): Promise<admin_directory_v1.Schema$User | null>

  // Groups
  createWorkspaceGroup(handle: DBHandle, group: Group): Promise<{ group: Group, workspaceGroup: admin_directory_v1.Schema$Group }>
  findWorkspaceGroup(handle: DBHandle, group: Group): Promise<admin_directory_v1.Schema$Group | null>
  addUserIntoWorkspaceGroup(handle: DBHandle, group: Group, user: User): Promise<admin_directory_v1.Schema$Member>
  removeUserFromWorkspaceGroup(handle: DBHandle, group: Group, user: User): Promise<boolean>
    getMembersForGroup(
    handle: DBHandle,
    group: Group
  ): Promise<{ user: User | null; workspaceMember: admin_directory_v1.Schema$Member | null }[]>
  getWorkspaceGroupsForWorkspaceUser(
    handle: DBHandle,
    user: User
  ): Promise<{ group: Group; workspaceGroup: admin_directory_v1.Schema$Group }[]>
}

export function getWorkspaceSyncService(userService: UserService, groupService: GroupService): WorkspaceSyncService {
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
    isSyncEnabled() {
      return configuration.WORKSPACE_SYNC_ENABLED === "true"
    },

    async createWorkspaceUser(handle, user) {
      if (user.workspaceUserId) {
        throw new Error("User already has a workspace user ID")
      }

      const directory = getDirectory()

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

    async resetWorkspaceUserPassword(handle, user) {
      const directory = getDirectory()

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

    async findWorkspaceUser(handle, user) {
      const directory = getDirectory()

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

    async addUserIntoWorkspaceGroup(handle, group, user) {
      const directory = getDirectory()

      const res = await directory.members.insert({
        groupKey: getKey(group),
        requestBody: {
          email: getKey(user),
          role: "MEMBER",
        },
      })

      invariant(res.data, "Expected response data to be defined")

      return res.data
    },

    async removeUserFromWorkspaceGroup(handle, group, user) {
      const directory = getDirectory()

      return await directory.members
        .delete({
          groupKey: getKey(group),
          memberKey: getKey(user),
        })
        .then(() => true)
        .catch(() => false)
    },

    async createWorkspaceGroup(handle, group) {
      if (group.workspaceGroupId) {
        throw new Error("Group already has a workspace group ID")
      }

      const directory = getDirectory()

      const { data } = await directory.groups.insert({
        requestBody: {
          email: getKey(group),
          name: group.name || group.slug,
        }
      })

      let updatedGroup = group

      if (!data.id) {
        logger.error("Failed to create group in workspace: No ID returned")
      } else {
        updatedGroup = await groupService.update(handle, group.slug, {
          workspaceGroupId: data.id
        })
      }

      return { group: updatedGroup, workspaceGroup: data}
    },

    async findWorkspaceGroup(handle, group) {
      const directory = getDirectory()

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

    async getMembersForGroup(handle, group) {
      const directory = getDirectory()

      const workspaceMembers: { user: User | null; workspaceMember: admin_directory_v1.Schema$Member | null }[] = []

      let pageToken: string | undefined = undefined
      do {
        const response: GaxiosResponse<admin_directory_v1.Schema$Members> = await directory.members.list({
          groupKey: group.workspaceGroupId ?? getKey(group),
          pageToken: pageToken,
        })
        invariant(response.data, "Expected response data to be defined")
        invariant(response.data.members, "Expected response data to be defined")

        const workspaceMembersIds = response.data.members.map((member) => member.id).filter(Boolean) as string[]
        const users = await userService.findByWorkspaceUserIds(handle, workspaceMembersIds)

        workspaceMembers.push(...joinOnWorkspaceUserId(users, response.data.members))

        pageToken = response.data.nextPageToken ?? undefined
      } while (pageToken !== undefined)

      return workspaceMembers
    },

    async getWorkspaceGroupsForWorkspaceUser(handle, user) {
      const directory = getDirectory()

      const groups: { group: Group; workspaceGroup: admin_directory_v1.Schema$Group }[] = []

      let pageToken: string | undefined = undefined
      do {
        const { data }: MinimalListReturn<"groups", admin_directory_v1.Schema$Group> = await directory.groups.list({
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
