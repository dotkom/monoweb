/**
 * For the sake of staying reasonable, we only support strings for now
 */
export type AnySpec = Record<
  PropertyKey,
  | import("zod").ZodString
  | import("zod").ZodDefault<import("zod").ZodString>
  | import("zod").ZodOptional<import("zod").ZodString>
>

/**
 * Parse the provided environment variables (or process.env) and return a typed object
 *
 * This function exists to normalize all environment variables to strings, and to provide runtime type safety for any
 * consumer of environment variables.
 */
export declare function createEnvironment<TSpec extends AnySpec>(
  schema: TSpec,
  env?: NodeJS.ProcessEnv
): import("zod").infer<import("zod").ZodObject<TSpec>>

export declare const variable: import("zod").ZodString
