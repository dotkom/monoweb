import type { TZDate } from "@date-fns/tz"
import { SidequestStatusSchema, type SidequestFilterQuery } from "@dotkomonline/rpc/sidequest"
import { getCurrentUTC, type DateRangeFilter, type SortOrder } from "@dotkomonline/utils"
import { roundToNearestMinutes } from "date-fns/roundToNearestMinutes"

export const SIDEQUEST_PAGE_TAKE = 20

export type SidequestsListQuery = {
  filter: SidequestFilterQuery
  take: number
}

export function getSidequestListNow(date: TZDate = getCurrentUTC()): TZDate {
  return roundToNearestMinutes(date, { roundingMethod: "floor" })
}

export function getFutureSidequestsQuery(now: TZDate, interestGroupIds?: string[]): SidequestsListQuery {
  return {
    filter: getSidequestListFilters({ max: null, min: now }, "asc", interestGroupIds),
    take: SIDEQUEST_PAGE_TAKE,
  }
}

export function getPastSidequestsQuery(now: TZDate, interestGroupIds?: string[]): SidequestsListQuery {
  return {
    filter: getSidequestListFilters({ max: now, min: null }, "desc", interestGroupIds),
    take: SIDEQUEST_PAGE_TAKE,
  }
}

function getSidequestListFilters(
  byEndDate: DateRangeFilter,
  orderBy: SortOrder,
  interestGroupIds?: string[]
): SidequestFilterQuery {
  return {
    byEndDate,
    orderBy,
    ...(interestGroupIds !== undefined ? { byInterestGroupId: interestGroupIds } : {}),
    byStatus: [SidequestStatusSchema.enum.PUBLISHED],
  }
}
