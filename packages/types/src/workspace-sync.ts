import type { admin_directory_v1 } from "googleapis"
import { z } from "zod"
import { GroupMemberSchema, GroupSchema } from "./group"

export type WorkspaceUser = admin_directory_v1.Schema$User
export type WorkspaceGroup = admin_directory_v1.Schema$Group
export type WorkspaceMember = admin_directory_v1.Schema$Member
export const WorkspaceUserSchema = z.custom<WorkspaceUser>()
export const WorkspaceGroupSchema = z.custom<WorkspaceGroup>()
export const WorkspaceMemberSchema = z.custom<WorkspaceMember>()

export const WorkspaceMemberSyncStateSchema = z.enum([
  "SYNCED", //
  "PENDING_LINK",
  "PENDING_ADD",
  "PENDING_REMOVE",
])
export type WorkspaceMemberSyncState = z.infer<typeof WorkspaceMemberSyncStateSchema>

export const WorkspaceMemberLinkSchema = z.object({
  groupMember: GroupMemberSchema.nullable(),
  workspaceMember: WorkspaceMemberSchema.nullable(),
  syncState: WorkspaceMemberSyncStateSchema,
})
export type WorkspaceMemberLink = z.infer<typeof WorkspaceMemberLinkSchema>

export const WorkspaceGroupLinkSchema = z.object({
  group: GroupSchema,
  workspaceGroup: WorkspaceGroupSchema,
})
export type WorkspaceGroupLink = z.infer<typeof WorkspaceGroupLinkSchema>
