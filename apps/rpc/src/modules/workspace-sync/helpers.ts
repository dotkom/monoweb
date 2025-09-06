import { randomBytes } from "node:crypto"
import type { Group, User } from "@dotkomonline/types"
import { slugify } from "@dotkomonline/utils"
import type { admin_directory_v1 } from "googleapis"
import invariant from "tiny-invariant"

const DEFAULT_DOMAIN = process.env.WORKSPACE_SYNC_DOMAIN ?? "online.ntnu.no"
const TEMPORARY_PASSWORD_LENGTH = 8

export function isSyncEnabled() {
  return process.env.WORKSPACE_SYNC_ENABLED === "true"
}

const getLocal = (localResolvable: admin_directory_v1.Schema$User | User | Group | string): string => {
  if (typeof localResolvable === "string") {
    return localResolvable
  }

  const isUser = "profileSlug" in localResolvable
  const isGroup = "type" in localResolvable

  if (isUser) {
    if (localResolvable.workspaceUserId) {
      return localResolvable.workspaceUserId
    }

    if (!localResolvable.name) {
      throw new Error("User name is required")
    }

    return localResolvable.name
  }

  if (isGroup) {
    return localResolvable.slug
  }

  if (!localResolvable.primaryEmail) {
    throw new Error("Workspace user email is required")
  }

  return localResolvable.primaryEmail
}

/**
 * @example
 * getKey("user") // "user@online.ntnu.no"
 * getKey("user@online.ntnu.no") // "user@online.ntnu.no"
 * getKey("user", "custom.domain") // "user@custom.domain"
 */
export function getKey(
  localResolvable: admin_directory_v1.Schema$User | User | Group | string,
  domain = DEFAULT_DOMAIN
) {
  const local = getLocal(localResolvable)

  if (local.includes("@")) {
    return local
  }

  return `${local}@${domain}`
}

export const getTemporaryPassword = () => {
  return randomBytes(TEMPORARY_PASSWORD_LENGTH).toString("base64").slice(0, TEMPORARY_PASSWORD_LENGTH)
}

export const getCommitteeEmail = (fullName: string) => {
  if (!fullName.trim()) {
    throw new Error("Invalid full name")
  }

  const sanitizedName = slugify(fullName.replaceAll(/\s+/g, "."))

  return getKey(sanitizedName)
}

type UserAndWorkspaceMember = { user: User | null; workspaceMember: admin_directory_v1.Schema$Member | null }

export const joinOnWorkspaceUserId = (
  users: User[],
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

    leftJoin.set(workspaceMember.id, { user: null, workspaceMember })
  }

  for (const user of users) {
    let entry = user.workspaceUserId ? leftJoin.get(user.workspaceUserId) : null
    entry ??= { user: null, workspaceMember: null }

    // Duplicate in the argument, since workspaceUserId is unique in the database.
    if (entry.user) {
      throw new Error(`Duplicate workspace user ID found: ${user.workspaceUserId}`)
    }

    if (!entry.workspaceMember || !user.workspaceUserId) {
      rightJoin.push({ user, workspaceMember: null })
      continue
    }

    leftJoin.set(user.workspaceUserId, { user, workspaceMember: entry.workspaceMember })
  }

  return [...leftJoin.values()].concat(rightJoin)
}
