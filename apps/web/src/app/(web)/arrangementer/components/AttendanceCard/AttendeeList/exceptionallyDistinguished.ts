import { TZDate } from "@date-fns/tz"
import { formatDate } from "date-fns"
import { FlagNameSchema, type UserFlag } from "@dotkomonline/rpc/user"

export function getExceptionallyDistinguishedFlag(flags: UserFlag[]) {
  return flags.find(({ name }) => name === FlagNameSchema.enum.EXCEPTIONALLY_DISTINGUISHED) ?? null
}

export function formatExceptionallyDistinguishedCreatedAtYear(flag: UserFlag) {
  const date = new TZDate(flag.awardedAt, "Europe/Oslo")

  return formatDate(date, "yyyy")
}
