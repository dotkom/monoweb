/**
 * Parse the provided environment variables (or process.env) and return a typed object
 *
 * This function exists to normalize all environment variables to strings, and to provide runtime type safety for any
 * consumer of environment variables.
 */
export declare function createEnvironment<T>(
  schema: Record<T, import("zod").ZodString>,
  env?: NodeJS.ProcessEnv
): Record<T, string>

export declare const variable: import("zod").ZodString
