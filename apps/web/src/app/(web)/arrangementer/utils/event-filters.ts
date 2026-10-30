import { EventTypeSchema, type EventFilterQuery } from "@dotkomonline/rpc/event"
import { GroupSchema } from "@dotkomonline/rpc/group"
import { z } from "zod"
import { getEventDateRange } from "./event-date"

export const EventListViewModeSchema = z.enum(["ATTENDANCE", "CHRONOLOGICAL"])
export type EventListViewMode = z.infer<typeof EventListViewModeSchema>

const EventFiltersSchema = z.object({
  search: z.string(),
  types: z.array(EventTypeSchema),
  groups: z.array(GroupSchema.shape.slug),
  sort: EventListViewModeSchema,
  date: z.iso.date().nullable().catch(null),
})

export type EventFilters = z.infer<typeof EventFiltersSchema>

export const DEFAULT_EVENT_SORT = "ATTENDANCE" satisfies EventFilters["sort"]

const FILTER_PARAMS = ["q", "type", "group", "sort", "date"] as const

export function clearEventFilterParams(params: URLSearchParams) {
  for (const key of FILTER_PARAMS) {
    params.delete(key)
  }
}

export function writeEventFilterParams(params: URLSearchParams, filters: EventFilters) {
  clearEventFilterParams(params)

  if (filters.search) {
    params.set("q", filters.search)
  }

  for (const type of filters.types) {
    params.append("type", type)
  }

  for (const group of filters.groups) {
    params.append("group", group)
  }

  if (filters.sort !== DEFAULT_EVENT_SORT) {
    params.set("sort", filters.sort)
  }

  if (filters.date) {
    params.set("date", filters.date)
  }
}

export const countActiveEventFilters = (filters: EventFilters) => {
  let count = 0

  if (filters.search) {
    count++
  }

  if (filters.types.length > 0) {
    count++
  }

  if (filters.groups.length > 0) {
    count++
  }

  if (filters.date) {
    count++
  }

  if (filters.sort !== DEFAULT_EVENT_SORT) {
    count++
  }

  return count
}

export function parseEventFilters(params: URLSearchParams): EventFilters {
  const search = params.get("q") ?? ""
  const types = params.getAll("type")
  const groups = params.getAll("group")
  const sort = params.get("sort") ?? DEFAULT_EVENT_SORT
  const date = params.get("date")

  return EventFiltersSchema.parse({
    search,
    types,
    groups,
    sort,
    date,
  })
}

export function toEventFilterQuery(filters: EventFilters): EventFilterQuery {
  const bySearchTerm = filters.search || undefined
  const byType = filters.types.length > 0 ? filters.types : undefined
  const byOrganizingGroup = filters.groups.length > 0 ? filters.groups : undefined
  const byStartDate = filters.date ? getEventDateRange(filters.date) : undefined

  return {
    bySearchTerm,
    byType,
    byOrganizingGroup,
    byStartDate,
  }
}
