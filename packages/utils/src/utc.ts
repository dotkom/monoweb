import { TZDate } from "@date-fns/tz"

export function getCurrentUTC(): TZDate {
  return new TZDate(new Date(), "UTC")
}
