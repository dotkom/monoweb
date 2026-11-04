import type { DBHandle } from "@dotkomonline/db"
import { minutesToMilliseconds } from "date-fns"
import { LRUCache } from "lru-cache"
import {
  ADMIN_AFFILIATIONS,
  COMMITTEE_AFFILIATIONS,
  CommitteeGroupSlug,
  hasAnyGroupAffiliation as principalHasAnyGroupAffiliation,
  hasEveryGroupAffiliation as principalHasEveryGroupAffiliation,
  intersectGroupAffiliations as principalIntersectGroupAffiliations,
  isAdministrator as principalIsAdministrator,
  isCommitteeMember as principalIsCommitteeMember,
} from "../permissions/principal"
import type { GroupId, GroupRoleType } from "./group/group"
import type { UserId } from "./user/user"

export { ADMIN_AFFILIATIONS, COMMITTEE_AFFILIATIONS, CommitteeGroupSlug }

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
    userAffiliations: Map<GroupId, Set<GroupRoleType>> | Set<GroupId> | ReadonlyArray<GroupId>,
    affiliationsToCompare: Set<GroupId> | ReadonlyArray<GroupId>
  ): Set<GroupId>

  /**
   * Find if the user has AT LEAST one affiliation of the given set of affiliations. Prefer to use this over manually
   * checking affiliations, since this will account for administrator permissions.
   */
  hasAnyGroupAffiliation(
    affiliations: Map<GroupId, Set<GroupRoleType>> | Set<GroupId> | ReadonlyArray<GroupId>,
    affiliationsToCompare: Set<GroupId> | ReadonlyArray<GroupId>
  ): boolean

  /**
   * Find if the user has EVERY affiliation of the given set of affiliations. Prefer to use this over manually checking
   * affiliations, since this will account for administrator permissions.
   */
  hasEveryGroupAffiliation(
    affiliations: Map<GroupId, Set<GroupRoleType>> | Set<GroupId> | ReadonlyArray<GroupId>,
    affiliationsToCompare: Set<GroupId> | ReadonlyArray<GroupId>
  ): boolean

  /**
   * Helper for using intersectGroupAffiliations with all committee affiliations.
   */
  isCommitteeMember(affiliations: Map<GroupId, Set<GroupRoleType>> | Set<GroupId> | ReadonlyArray<GroupId>): boolean

  /**
   * Helper for using intersectGroupAffiliations with all administrator affiliations.
   */
  isAdministrator(affiliations: Map<GroupId, Set<GroupRoleType>> | Set<GroupId> | ReadonlyArray<GroupId>): boolean
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

      for (const role of roles) {
        groupRoles.add(role.type)
      }

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
      return principalIntersectGroupAffiliations(userAffiliations, affiliationsToCompare)
    },

    hasAnyGroupAffiliation(userAffiliations, affiliationsToCompare) {
      return principalHasAnyGroupAffiliation(userAffiliations, affiliationsToCompare)
    },

    hasEveryGroupAffiliation(userAffiliations, affiliationsToCompare) {
      return principalHasEveryGroupAffiliation(userAffiliations, affiliationsToCompare)
    },

    isCommitteeMember(userAffiliations) {
      return principalIsCommitteeMember(userAffiliations)
    },

    isAdministrator(userAffiliations) {
      return principalIsAdministrator(userAffiliations)
    },
  }
}
