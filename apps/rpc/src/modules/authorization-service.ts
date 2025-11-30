import type { DBHandle } from "@dotkomonline/db"
import type { GroupId, UserId } from "@dotkomonline/types"
import { minutesToMilliseconds } from "date-fns"
import { LRUCache } from "lru-cache"

export type AffiliationSet = Set<GroupId>

export const Affiliation = {
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
} as const satisfies Record<PropertyKey, GroupId>
export type Affiliation = (typeof Affiliation)[keyof typeof Affiliation]

export const ADMIN_AFFILIATIONS = ["dotkom", "hs"] as const satisfies Affiliation[]

export const isAffiliation = (groupSlug: string): groupSlug is Affiliation => {
  const affiliations = Object.values(Affiliation) as string[]
  return affiliations.includes(groupSlug)
}

export interface AuthorizationService {
  /**
   * Find the affiliations of a user.
   *
   * An affiliation is a group (committee, node committee, other group) or interest group membership that can be used to
   * authorize access to resources in the system.
   */
  getAffiliations(handle: DBHandle, userId: UserId): Promise<AffiliationSet>
}

export function getAuthorizationService(): AuthorizationService {
  const cache = new LRUCache<UserId, AffiliationSet>({
    max: 1000,
    // We are tolerant with up to five minutes of cache staleness here as the system rarely ever has changes to the user
    // affiliations, and there is minimal risk of abuse of the system.
    ttl: minutesToMilliseconds(1),
  })
  return {
    async getAffiliations(handle, userId) {
      const match = cache.get(userId)
      if (match !== undefined) {
        return match
      }
      // We use a raw query here to avoid the disturbing amount of objects the Prisma client query would be constructed
      // with. The query is simple enough that it is safe to use a raw query here.
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
      const affiliations = new Set(memberGroupSlugs)
      cache.set(userId, affiliations)
      return affiliations
    },
  }
}
