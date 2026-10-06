import type { TZDate } from "@date-fns/tz"
import {
  InterestGroupEventStatusSchema,
  type InterestGroupEventFilterQuery,
} from "@dotkomonline/rpc/interest-group-event"
import { getCurrentUTC, type DateRangeFilter, type SortOrder } from "@dotkomonline/utils"
import { roundToNearestMinutes } from "date-fns/roundToNearestMinutes"

export const INTEREST_GROUP_EVENT_PAGE_TAKE = 20

export type InterestGroupEventsListQuery = {
  filter: InterestGroupEventFilterQuery
  take: number
}

export function getInterestGroupEventListNow(date: TZDate = getCurrentUTC()): TZDate {
  return roundToNearestMinutes(date, { roundingMethod: "floor" })
}

export function getFutureInterestGroupEventsQuery(
  now: TZDate,
  interestGroupIds?: string[]
): InterestGroupEventsListQuery {
  return {
    filter: getInterestGroupEventListFilters({ max: null, min: now }, "asc", interestGroupIds),
    take: INTEREST_GROUP_EVENT_PAGE_TAKE,
  }
}

export function getPastInterestGroupEventsQuery(
  now: TZDate,
  interestGroupIds?: string[]
): InterestGroupEventsListQuery {
  return {
    filter: getInterestGroupEventListFilters({ max: now, min: null }, "desc", interestGroupIds),
    take: INTEREST_GROUP_EVENT_PAGE_TAKE,
  }
}

function getInterestGroupEventListFilters(
  byEndDate: DateRangeFilter,
  orderBy: SortOrder,
  interestGroupIds?: string[]
): InterestGroupEventFilterQuery {
  return {
    byEndDate,
    orderBy,
    ...(interestGroupIds !== undefined ? { byInterestGroupId: interestGroupIds } : {}),
    byStatus: [InterestGroupEventStatusSchema.enum.PUBLISHED],
  }
}
