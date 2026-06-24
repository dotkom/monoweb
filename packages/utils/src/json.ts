import { z } from "zod"

/**
 * Builds a schema for an arbitrary JSON value that rejects values nested deeper than `maxDepth` levels.
 *
 * This mirrors the validation that used to be emitted by the Prisma zod generator for `Json` columns, and is used by
 * the domain schemas when parsing rows that originate from `Json` database columns.
 */
export function buildLimitedDepthJsonSchema(maxDepth = 10) {
  return z.unknown().refine((value) => {
    const getDepth = (object: unknown, depth = 0): number => {
      if (depth > maxDepth) {
        return depth
      }

      if (object === null || typeof object !== "object") {
        return depth
      }

      const values = Object.values(object as Record<string, unknown>)

      if (values.length === 0) {
        return depth
      }

      return Math.max(...values.map((nested) => getDepth(nested, depth + 1)))
    }

    return getDepth(value) <= maxDepth
  }, `JSON nesting depth exceeds maximum of ${maxDepth}`)
}
