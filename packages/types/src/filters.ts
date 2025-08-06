import { TZDate } from "@date-fns/tz"
import { z } from "zod"

/**
 * @packageDocumentation
 *
 * This module defines common filtering types used in the application. These functions are composable and are intended
 * to be used across different domains. They are intentionally made generic enough.
 */

export type DateRangeFilter = z.infer<ReturnType<typeof buildDateRangeFilter>>

/**
 * Expect a field to lie within a specific date range
 *
 * The dates are ALWAYS mapped back to UTC because the server should ALWAYS handle data in UTC with zero exceptions.
 */
export function buildDateRangeFilter() {
  return z
    .object({
      min: z.coerce
        .date()
        .transform((d) => new TZDate(d, "UTC"))
        .nullable(),
      max: z.coerce
        .date()
        .transform((d) => new TZDate(d, "UTC"))
        .nullable(),
    })
    .default({
      min: null,
      max: null,
    })
}

export type AnyOfFilter<T> = z.infer<ReturnType<typeof buildAnyOfFilter<T>>>

/** Expect a field to be one of the provided values */
export function buildAnyOfFilter<T>(inner: z.Schema<T>) {
  return z.array(inner).default([])
}

export type SearchFilter = z.infer<ReturnType<typeof buildSearchFilter>>

/** Expect a field to be a search string */
export function buildSearchFilter() {
  return z.string().nullable().default(null)
}

export type SortOrder = z.infer<ReturnType<typeof createSortOrder>>

/** Expect a field to be a valid order by value */
export function createSortOrder() {
  return z.enum(["asc", "desc"]).default("desc")
}
