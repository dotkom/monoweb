// This regex matches `_x` where x is a lowercase letter. It ignores `__x` (more than 1 underscore).
const SNAKE_TO_CAMEL_REGEX = /([^_])_([a-z])/g

/**
 * Convert snake cased objects to camel case objects.
 *
 * This is made primarily for use with Prisma output, and is not secure for user input.
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
export const snakeCaseToCamelCase = (input: any): any => {
  if (input === null || typeof input !== "object") {
    return input
  }

  if (input instanceof Date) {
    return input
  }

  if (Array.isArray(input)) {
    return input.map((el) => snakeCaseToCamelCase(el))
  }

  if (typeof Buffer !== "undefined" && Buffer.isBuffer(input)) {
    return input
  }

  if (input.constructor && input.constructor !== Object) {
    return input
  }

  const newObject: Record<string, unknown> = {}

  for (const key in input) {
    if (!Object.hasOwn(input, key)) {
      continue
    }

    const newKey = key.replace(SNAKE_TO_CAMEL_REGEX, (_, charBefore, charAfter) => charBefore + charAfter.toUpperCase())

    newObject[newKey] = snakeCaseToCamelCase(input[key])
  }

  return newObject
}
