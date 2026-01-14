import type { DBHandle } from "@dotkomonline/db"
import type { GroupId, UserId } from "@dotkomonline/types"
import { minutesToMilliseconds } from "date-fns"
import { LRUCache } from "lru-cache"

export const EditorRole = {
  APPKOM: "appkom",
  ARRKOM: "arrkom",
  BACKLOG: "backlog",
  BANKOM: "bankom",
  BEDKOM: "bedkom",
  DEBUG: "debug",
  DOTKOM: "dotkom",
  FAGKOM: "fagkom",
  FEMINIT: "feminit",
  HS: "hs",
  KOMITELEDERE: "komiteledere",
  ONLINE_IL: "onlineil",
  FOND: "fond",
  PROKOM: "prokom",
  EKSKOM: "ekskom",
  ITEX: "ekskom",
  JUBKOM: "jubkom",
  DOTDAGENE: "dotdagene",
} as const satisfies Record<PropertyKey, GroupId>
export type EditorRole = (typeof EditorRole)[keyof typeof EditorRole]

export const EDITOR_ROLES = Object.values(EditorRole)
export const ADMIN_EDITOR_ROLES = ["dotkom", "hs"] as const satisfies EditorRole[]
const EDITOR_ROLES_SET = new Set(EDITOR_ROLES)

export const isEditorRole = (groupSlug: string): groupSlug is EditorRole => {
  return (EDITOR_ROLES as string[]).includes(groupSlug)
}

export interface AuthorizationService {
  /**
   * Find the editor roles of a user.
   *
   * An editor role is an affiliation with a group (committee, node committee, etc.) that has been given access to
   * resources in the system.
   *
   * In practice this means that the user is affiliated with a committee (like Dotkom) or a node comittee (like Velkom).
   *
   * NOTE: Prefer to use {@link AuthorizationService#intersectEditorRoles} over manually checking affiliations, since
   * this method will account for administrator permissions.
   */
  getEditorRoles(handle: DBHandle, userId: UserId): Promise<Set<EditorRole>>

  /**
   * Find the slugs of all groups the user has an active membership in. These are not restricted to editor roles, and
   * can for example include interest groups.
   *
   * NOTE: Prefer to use {@link AuthorizationService#intersectGroupAffiliations} over manually checking affiliations, since
   * this method will account for administrator permissions.
   */
  getGroupAffiliations(handle: DBHandle, userId: UserId): Promise<Set<GroupId>>

  /**
   * Find the intersection of the user's editor roles and the given set of editor roles. Prefer to use this over
   * manually checking affiliations, since this will account for administrator permissions.
   *
   * This is functionally equivalent to {@link AuthorizationService#intersectGroupAffiliations} but more strictly typed.
   */
  intersectEditorRoles(
    handle: DBHandle,
    userId: UserId,
    editorRoleSet: Set<EditorRole> | Array<EditorRole>
  ): Promise<Set<EditorRole>>

  /**
   * Find the intersection of the user's group affiliations and the given set of affiliations. Prefer to use this over
   * manually checking affiliations, since this will account for administrator permissions.
   *
   * This is functionally equivalent to {@link AuthorizationService#intersectEditorRoles} but less strictly typed.
   */
  intersectGroupAffiliations(
    handle: DBHandle,
    userId: UserId,
    groupAffiliationSet: Set<GroupId> | Array<GroupId>
  ): Promise<Set<GroupId>>
}

export function getAuthorizationService(): AuthorizationService {
  const cache = new LRUCache<UserId, Set<GroupId>>({
    max: 1000,
    // We would be tolerant with a few minutes of cache staleness here as the system rarely ever has changes to the user
    // edit roles, and there is minimal risk of abuse of the system.
    ttl: minutesToMilliseconds(1),
  })

  return {
    async getGroupAffiliations(handle, userId) {
      const match = cache.get(userId)

      if (match !== undefined) {
        return match
      }

      const memberGroups = await handle.group.findMany({
        where: {
          memberships: {
            some: {
              userId,
              end: null,
            },
          },
        },
        select: {
          slug: true,
        },
      })

      const memberGroupSlugs = memberGroups.map((m) => m.slug)
      const editorRoles = new Set(memberGroupSlugs)

      cache.set(userId, editorRoles)

      return editorRoles
    },

    async getEditorRoles(handle, userId) {
      const groupAffiliations = await this.getGroupAffiliations(handle, userId)

      return groupAffiliations.intersection(EDITOR_ROLES_SET)
    },

    async intersectGroupAffiliations(handle, userId, otherGroupAffiliations) {
      const otherGroupAffiliationsSet = Array.isArray(otherGroupAffiliations)
        ? new Set(otherGroupAffiliations)
        : otherGroupAffiliations

      const groupAffiliations = await this.getGroupAffiliations(handle, userId)

      if (ADMIN_EDITOR_ROLES.some((adminEditorRole) => groupAffiliations.has(adminEditorRole))) {
        return otherGroupAffiliationsSet
      }

      return groupAffiliations.intersection(otherGroupAffiliationsSet)
    },

    async intersectEditorRoles(handle, userId, otherEditorRoles) {
      const otherEditorRolesSet = Array.isArray(otherEditorRoles) ? new Set(otherEditorRoles) : otherEditorRoles

      const editorRoles = await this.getEditorRoles(handle, userId)

      if (ADMIN_EDITOR_ROLES.some((adminEditorRole) => editorRoles.has(adminEditorRole))) {
        return otherEditorRolesSet
      }

      return editorRoles.intersection(otherEditorRolesSet)
    },
  }
}
