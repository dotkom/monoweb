import { TZDate } from "@date-fns/tz"

export * from "./slugify"
export * from "./utc"

export function getCurrentUtc(): TZDate {
  return new TZDate(TZDate.now(), "UTC")
}
