import { getLogger } from "@dotkomonline/logger"
import type { z } from "zod"

const logger = getLogger("db-query-invariant-checker")

/**
 * Ensure that the value conforms to the schema, or throw an error.
 *
 * This is VERY important to ALWAYS use when returning values from the database. If we do not parse the rows returned,
 * there is ZERO RUNTIME GUARANTEES that the data conforms to the schema. In fact, TypeScript will HAPPILY lie to us
 * since we never checked.
 */
export function parseOrReport<T extends z.ZodType>(schema: T, value: z.infer<T> | unknown): z.infer<T> {
  const result = schema.safeParse(value)
  if (!result.success) {
    logger.error("Database failed to parse value into schema: %s emitted for object %o", result.error.message, value)
    throw new Error("Database returned value that does not conform to schema")
  }
  return result.data
}
