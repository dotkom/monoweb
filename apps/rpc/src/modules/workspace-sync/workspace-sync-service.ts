import { getLogger } from "@dotkomonline/logger"
import type { Group, User } from "@dotkomonline/types"
import type { admin_directory_v1 } from "googleapis"

export interface WorkspaceSyncService {
  // User
  createWorkspaceUser(user: User): Promise<{ user: User; workspaceUser: admin_directory_v1.Schema$User } | null>
  resetWorkspaceUserPassword(user: User): Promise<{
    user: User
    workspaceUser: admin_directory_v1.Schema$User
    recoveryCodes: string[] | null
    password: string
  } | null>
  getWorkspaceUser(user: User): Promise<{ user: User; workspaceUser: admin_directory_v1.Schema$User } | null>

  // Groups
  getWorkspaceGroup(group: Group): Promise<{ group: Group; workspaceGroup: admin_directory_v1.Schema$Group } | null>
  insertUserIntoWorkspaceGroup(
    group: Group,
    user: User
  ): Promise<{ user: User; workspaceMember: admin_directory_v1.Schema$Member }>
  removeUserFromWorkspaceGroup(group: Group, user: User): Promise<boolean>
  getMembersForWorkspaceGroup(group: Group): Promise<{
    group: Group
    workspaceGroup: admin_directory_v1.Schema$Group
    members: {
      user: User
      workspaceMember: admin_directory_v1.Schema$Member
    }[]
  }>
  getWorkspaceGroupsForWorkspaceUser(
    user: User
  ): Promise<{ group: Group; workspaceGroup: admin_directory_v1.Schema$Group }[]>
}

export function getWorkspaceSyncService(): WorkspaceSyncService {
  const logger = getLogger("workspace-sync-service")
  return {}
}
