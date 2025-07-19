import type { DBHandle } from "@dotkomonline/db"
import type { GroupId, UserId } from "@dotkomonline/types"
import { minutesToMilliseconds } from "date-fns"
import { LRUCache } from "lru-cache"
import invariant from "tiny-invariant"

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
} as const
export type Affiliation = (typeof Affiliation)[keyof typeof Affiliation]

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
    ttl: minutesToMilliseconds(5),
  })
  return {
    async getAffiliations(handle, userId) {
      const match = cache.get(userId)
      if (match !== undefined) {
        return match
      }
      // We use a raw query here to avoid the disturbing amount of objects the Prisma client query would be constructed
      // with. The query is simple enough that it is safe to use a raw query here.
      type Row = { userId: UserId; groups: GroupId[] }
      const records = await handle.$queryRawUnsafe<Row[]>(
        `
            SELECT ow_user.id                                         AS "userId",
                   array_agg(group_member."groupId")                  AS "groups"
            FROM ow_user
                     LEFT JOIN group_member ON ow_user.id = group_member."userId"
            WHERE ow_user.id = $1
            GROUP BY ow_user.id LIMIT 1;
        `,
        userId
      )
      invariant(records.length <= 1, "query should never return more than one row")
      const record = records.at(0)
      if (record === undefined) {
        cache.delete(userId)
        return new Set()
      }
      const affiliations = new Set([...record.groups])
      cache.set(userId, affiliations)
      return affiliations
    },
  }
}
