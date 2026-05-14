import type { ContestWrite } from "@dotkomonline/rpc/contest"
import type { z } from "zod"

const MIN_NAME_LENGTH = 2

export const validateContestWrite = (contest: ContestWrite): z.ZodIssue[] => {
  const issues: z.ZodIssue[] = []

  if (!contest.name || contest.name.length < MIN_NAME_LENGTH) {
    issues.push({
      code: "custom",
      message: `Navn må være minst ${MIN_NAME_LENGTH} tegn langt`,
      path: ["name"],
    })
  }

  return issues
}
