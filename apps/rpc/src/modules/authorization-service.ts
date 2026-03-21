import type { DBHandle } from "@dotkomonline/db"
import type { GroupId, GroupRoleType, UserId } from "@dotkomonline/types"
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
  "trikom",
  "velkom",
] as const satisfies GroupId[]

export const ADMIN_AFFILIATIONS = ["dotkom", "hs"] as const satisfies GroupId[]

export interface AuthorizationService {
  /**
   * Find the slugs of all groups the user has an active membership in. These are not restricted to editor roles, and
   * can for example include interest groups.
   *
   * NOTE: Prefer to use {@link AuthorizationService#intersectGroupAffiliations} over manually checking affiliations,
   * since that method will account for administrator permissions.
   */
  getGroupAffiliations(handle: DBHandle, userId: UserId): Promise<Map<GroupId, Set<GroupRoleType>>>

  /**
   * Find the intersection of the user's group affiliations and the given set of affiliations. Prefer to use this over
   * manually checking affiliations, since this will account for administrator permissions.
   */
  intersectGroupAffiliations(
    userAffiliations: Map<GroupId, Set<GroupRoleType>> | Set<GroupId> | Array<GroupId>,
    affiliationsToCompare: Set<GroupId> | Array<GroupId>
  ): Set<GroupId>

  /**
   * Find if the user has AT LEAST one affiliation of the given set of affiliations. Prefer to use this over manually
   * checking affiliations, since this will account for administrator permissions.
   */
  hasAnyGroupAffiliation(
    affiliations: Map<GroupId, Set<GroupRoleType>> | Set<GroupId> | Array<GroupId>,
    affiliationsToCompare: Set<GroupId> | Array<GroupId>
  ): boolean

  /**
   * Find if the user has EVERY affiliation of the given set of affiliations. Prefer to use this over manually checking
   * affiliations, since this will account for administrator permissions.
   */
  hasEveryGroupAffiliation(
    affiliations: Map<GroupId, Set<GroupRoleType>> | Set<GroupId> | Array<GroupId>,
    affiliationsToCompare: Set<GroupId> | Array<GroupId>
  ): boolean

  /**
   * Helper for using intersectGroupAffiliations with all committee affiliations.
   */
  isCommitteeMember(affiliations: Map<GroupId, Set<GroupRoleType>> | Set<GroupId> | Array<GroupId>): boolean

  /**
   * Helper for using intersectGroupAffiliations with all administrator affiliations.
   */
  isAdministrator(affiliations: Map<GroupId, Set<GroupRoleType>> | Set<GroupId> | Array<GroupId>): boolean
}

export function getAuthorizationService(): AuthorizationService {
  const cache = new LRUCache<UserId, Map<GroupId, Set<GroupRoleType>>>({
    max: 1000,
    // We would be tolerant with a few minutes of cache staleness here as the system rarely ever has changes to the user
    // edit roles, and there is minimal risk of abuse of the system.
    ttl: minutesToMilliseconds(1),
  })

  const getFromCache = async (handle: DBHandle, userId: UserId) => {
    const match = cache.get(userId)

    if (match) {
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
        roles: {
          select: {
            type: true,
          },
        },
      },
    })

    const newCache = new Map<GroupId, Set<GroupRoleType>>()

    for (const { slug, roles } of memberGroups) {
      const groupRoles = newCache.get(slug) ?? new Set<GroupRoleType>()
      roles.forEach((role) => void groupRoles.add(role.type))
      newCache.set(slug, groupRoles)
    }

    cache.set(userId, newCache)

    return newCache
  }

  return {
    async getGroupAffiliations(handle, userId) {
      const match = await getFromCache(handle, userId)

      return match
    },

    intersectGroupAffiliations(userAffiliations, affiliationsToCompare) {
      const setA = toSet(userAffiliations)
      const setB = toSet(affiliationsToCompare)

      if (ADMIN_AFFILIATIONS.some((adminAffiliation) => setA.has(adminAffiliation))) {
        return setB
      }

      return setA.intersection(setB)
    },

    hasAnyGroupAffiliation(userAffiliations, affiliationsToCompare) {
      const intersection = this.intersectGroupAffiliations(userAffiliations, affiliationsToCompare)

      return intersection.size > 0
    },

    hasEveryGroupAffiliation(userAffiliations, affiliationsToCompare) {
      const intersection = this.intersectGroupAffiliations(userAffiliations, affiliationsToCompare)
      const desiredSize = toSet(affiliationsToCompare).size

      return intersection.size === desiredSize
    },

    isCommitteeMember(userAffiliations) {
      const intersection = this.intersectGroupAffiliations(userAffiliations, COMMITTEE_AFFILIATIONS)

      return intersection.size > 0
    },

    isAdministrator(userAffiliations) {
      const intersection = this.intersectGroupAffiliations(userAffiliations, ADMIN_AFFILIATIONS)

      return intersection.size > 0
    },
  }
}

function toSet<T>(input: Map<T, unknown> | Set<T> | Array<T>): Set<T> {
  if (input instanceof Map) {
    return new Set(input.keys())
  }

  if (Array.isArray(input)) {
    return new Set(input)
  }

  return input
}
