import { toNestErrors } from "@hookform/resolvers"
import type { FieldValues, Resolver } from "react-hook-form"
import type { z } from "zod"

function parseZodIssues(issues: z.core.$ZodIssue[]) {
  const errors: Record<string, { type: string; message: string }> = {}

  for (const issue of issues) {
    const path = issue.path.map(String).join(".")
    if (path in errors) {
      continue
    }
    errors[path] = { type: issue.code, message: issue.message }
  }

  return errors
}

/**
 * Zod v4-compatible resolver. @hookform/resolvers v4 reads ZodError.errors (v3),
 * but Zod v4 exposes issues instead — causing uncaught ZodErrors at runtime.
 */
export function zodResolver<T extends FieldValues>(schema: z.ZodType<T>): Resolver<T> {
  return async (values, _, options) => {
    const result = await schema.safeParseAsync(values)
    if (result.success) {
      return { values: result.data, errors: {} }
    }

    return {
      values: {},
      errors: toNestErrors(parseZodIssues(result.error.issues), options),
    }
  }
}
