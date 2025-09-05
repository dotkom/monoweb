import { randomBytes } from "node:crypto"
import type { Group, User } from "@dotkomonline/types"
import { slugify } from "@dotkomonline/utils"
import type { admin_directory_v1 } from "googleapis"

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

export const intersectOnWorkspaceUserId = (
  users: User[],
  workspaceUsers: admin_directory_v1.Schema$Member[]
): { user: User | null; workspaceMember: admin_directory_v1.Schema$Member | null }[] => {
  const intersection = new Map<
    string,
    { user: User | null; workspaceMember: admin_directory_v1.Schema$Member | null }
  >()

  for (const workspaceMember of workspaceUsers) {
    if (workspaceMember.id) {
      intersection.set(workspaceMember.id, { user: null, workspaceMember })
    }
  }

  for (const user of users) {
    if (user.workspaceUserId) {
      const entry = intersection.get(user.workspaceUserId)

      intersection.set(user.workspaceUserId, { user, workspaceMember: entry?.workspaceMember ?? null })
    }
  }

  return [...intersection.values()]
}
