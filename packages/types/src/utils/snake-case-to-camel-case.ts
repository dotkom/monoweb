// This regex matches `_x` where x is a lowercase letter. It ignores `__x` (more than 1 underscore).
const SNAKE_CASE_REGEX = /(^|[^_])_([a-z])/g

/**
 * Convert snake cased objects to camel case objects
 *
 * @example
 * const object = {
 *     "cherry": true,
 *     "honey_badger": false,
 *     "rio_de_janeiro": false
 * };
 *
 * const schema = z.object({
 *     cherry: z.boolean(),
 *     honeyBadger: z.boolean(),
 *     rioDeJaneiro: z.boolean()
 * });
 *
 * const result = z
 *     .preprocess(data => snakeCaseToCamelCase(data), schema)
 *     .parse(object);
 */
// biome-ignore lint/suspicious/noExplicitAny: This should be any
export const snakeCaseToCamelCase = (object: any): any => {
  if (object instanceof Date) {
    return object
  }

  if (Array.isArray(object)) {
    return object.map((element) => snakeCaseToCamelCase(element))
  }

  if (object === null || typeof object !== "object") {
    return object
  }

  // Don't walk special objects (common Prisma/raw DB types)
  if (object?.constructor?.name === "Decimal") {
    return object
  }

  if (typeof Buffer !== "undefined" && Buffer.isBuffer(object)) {
    return object
  }

  const newObject: Record<string, unknown> = {}

  Object.keys(object).forEach((key) => {
    const newKey = key.replace(
      SNAKE_CASE_REGEX,
      (_, beforeUnderscore, afterUnderscore) => beforeUnderscore + afterUnderscore.toUpperCase()
    )

    newObject[newKey] = snakeCaseToCamelCase(object[key])
  })

  return newObject
}
