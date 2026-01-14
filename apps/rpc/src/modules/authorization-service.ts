import type { DBHandle } from "@dotkomonline/db"
import type { GroupId, UserId } from "@dotkomonline/types"
import { minutesToMilliseconds } from "date-fns"
import { LRUCache } from "lru-cache"

export const COMMITTEE_AFFILIATIONS = [
  "appkom",
  "arrkom",
  "backlog",
  "bankom",
  "bedkom",
  "debug",
  "dotkom",
  "fagkom",
  "feminit",
  "hs",
  "online-il",
  "fond",
  "prokom",
  "ekskom",
  "jubkom",
  "dotdagene",
  "trikom"
 ] as const satisfies GroupId[]

export const ADMIN_AFFILIATIONS = ["dotkom", "hs"] as const satisfies GroupId[]

export interface AuthorizationService {
  /**
   * Find the slugs of all groups the user has an active membership in. These are not restricted to editor roles, and
   * can for example include interest groups.
   *
   * NOTE: Prefer to use {@link AuthorizationService#intersectGroupAffiliations} over manually checking affiliations, since
   * this method will account for administrator permissions.
   */
  getGroupAffiliations(handle: DBHandle, userId: UserId): Promise<Set<GroupId>>

  /**
   * Find the intersection of the user's group affiliations and the given set of affiliations. Prefer to use this over
   * manually checking affiliations, since this will account for administrator permissions.
   */
  intersectGroupAffiliations(
    handle: DBHandle,
    userId: UserId,
    groupAffiliationSet: Set<GroupId> | Array<GroupId>
  ): Promise<Set<GroupId>>

  /**
   * Find if the user has AT LEAST one affiliation of the given set of affiliations. Prefer to use this over manually
   * checking affiliations, since this will account for administrator permissions.
   */
  hasSomeGroupAffiliation(
    handle: DBHandle,
    userId: UserId,
    groupAffiliationSet: Set<GroupId> | Array<GroupId>
  ): Promise<Set<GroupId>>

  /**
   * Find if the user has EVERY affiliation of the given set of affiliations. Prefer to use this over manually checking
   * affiliations, since this will account for administrator permissions.
   */
  hasEveryGroupAffiliation(
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
