import { randomBytes } from "node:crypto"
import type { Group, User } from "@dotkomonline/types"
import { slugify } from "@dotkomonline/utils"
import type { admin_directory_v1 } from "googleapis"
import { configuration } from "src/configuration"
import invariant from "tiny-invariant"

const TEMPORARY_PASSWORD_LENGTH = 8

const getLocal = (localResolvable: User | Group | string): string => {
  if (typeof localResolvable === "string") {
    return localResolvable
  }

  const isGroup = "type" in localResolvable

  if (isGroup) {
    return localResolvable.slug
  }

  // It is a user
  if (!localResolvable.name) {
    throw new Error("User name is required")
  }

  return localResolvable.name
}

/**
 * @example
 * getEmail("user") // "user@online.ntnu.no"
 * getEmail("user@online.ntnu.no") // "user@online.ntnu.no"
 * getEmail("user", "custom.domain") // "user@custom.domain"
 */
export function getEmail(localResolvable: User | Group | string, domain = configuration.WORKSPACE_DOMAIN) {
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
export const getKey = (localResolvable: User | Group | string, domain = configuration.WORKSPACE_DOMAIN) => {
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
