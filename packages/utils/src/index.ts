import { TZDate } from "@date-fns/tz"

export * from "./slugify"
export * from "./utc"
export * from "./unique"
export * from "./holidays"

export function getCurrentUtc(): TZDate {
  return new TZDate(TZDate.now(), "UTC")
}
