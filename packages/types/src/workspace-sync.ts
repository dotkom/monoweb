import type { admin_directory_v1 } from "googleapis"
import { z } from "zod"

// Re-export types from googleapis package
export const WorkspaceUserSchema = z.custom<admin_directory_v1.Schema$User>()
export const WorkspaceGroupSchema = z.custom<admin_directory_v1.Schema$Group>()
export const WorkspaceMemberSchema = z.custom<admin_directory_v1.Schema$Member>()
export type WorkspaceUser = admin_directory_v1.Schema$User
export type WorkspaceGroup = admin_directory_v1.Schema$Group
export type WorkspaceMember = admin_directory_v1.Schema$Member

export const WorkspaceMemberSyncActionSchema = z.enum(["NONE", "NEEDS_LINKING", "TO_ADD", "TO_REMOVE"])

export type WorkspaceMemberSyncAction = z.infer<typeof WorkspaceMemberSyncActionSchema>
