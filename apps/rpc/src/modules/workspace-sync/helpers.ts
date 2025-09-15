import { randomBytes } from "node:crypto"
import type { Group, GroupMember, User } from "@dotkomonline/types"
import { slugify } from "@dotkomonline/utils"
import type { admin_directory_v1 } from "googleapis"
import invariant from "tiny-invariant"
import { configuration } from "../../configuration"

const TEMPORARY_PASSWORD_LENGTH = 8

const getLocal = (localResolvable: User | Group | string): string => {
  if (typeof localResolvable === "string") {
    return slugify(localResolvable, ".")
  }

  const isGroup = "type" in localResolvable

  if (isGroup) {
    return slugify(localResolvable.slug, ".")
  }

  // It is a user
  if (!localResolvable.name) {
    throw new Error("User name is required")
  }

  return slugify(localResolvable.name, ".")
}

/**
 * @example
 * getEmail("user") // "user@online.ntnu.no"
 * getEmail("user@online.ntnu.no") // "user@online.ntnu.no"
 * getEmail("user", "custom.domain") // "user@custom.domain"
 */
export function getEmail(localResolvable: User | Group | string, domain = configuration.WORKSPACE_DOMAIN): string {
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
export const getKey = (localResolvable: User | Group | string, domain = configuration.WORKSPACE_DOMAIN): string => {
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

export const getKeys = (localResolvable: User | Group | string, domain = configuration.WORKSPACE_DOMAIN): string[] => {
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

export const getTemporaryPassword = () => {
  return randomBytes(TEMPORARY_PASSWORD_LENGTH).toString("base64").slice(0, TEMPORARY_PASSWORD_LENGTH)
}

export const getCommitteeEmail = (fullName: string) => {
  if (!fullName.trim()) {
    throw new Error("Invalid full name")
  }

  return getKey(slugify(fullName, "."))
}

type UserAndWorkspaceMember = {
  groupMember: GroupMember | null
  workspaceMember: admin_directory_v1.Schema$Member | null
}

export const joinOnWorkspaceUserId = (
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
