import { randomBytes } from "node:crypto"
import type { Group, User } from "@dotkomonline/types"
import { slugify } from "@dotkomonline/utils"

const DEFAULT_DOMAIN = process.env.WORKSPACE_SYNC_DOMAIN ?? "online.ntnu.no"
const TEMPORARY_PASSWORD_LENGTH = 8

export function isSyncEnabled() {
  return process.env.WORKSPACE_SYNC_ENABLED === "true"
}

const getLocal = (localResolvable: User | Group | string): string => {
  if (typeof localResolvable === "string") {
    return localResolvable
  }
  
  if ("type" in localResolvable) {
    return  localResolvable.slug
  }

  if (localResolvable.workspaceUserId) {
    return localResolvable.workspaceUserId
  }

  if (!localResolvable.name) {
    throw new Error("User name is required")
  }

  return localResolvable.name
}

/**
 * @example
 * getKey("user") // "user@online.ntnu.no"
 * getKey("user@online.ntnu.no") // "user@online.ntnu.no"
 * getKey("user", "custom.domain") // "user@custom.domain"
 */
export function getKey(localResolvable: User | Group | string, domain = DEFAULT_DOMAIN) {
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
