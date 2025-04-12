/**
 * For the sake of staying reasonable, we only support strings for now
 */
export type AnySpec = Record<
  PropertyKey,
  | import("zod").ZodString
  | import("zod").ZodDefault<import("zod").ZodString>
  | import("zod").ZodOptional<import("zod").ZodString>
>

export type DopplerEnvironmentSpec = {
  DOPPLER_PROJECT: import("zod").ZodOptional<import("zod").ZodString>
  DOPPLER_ENVIRONMENT: import("zod").ZodOptional<import("zod").ZodString>
  DOPPLER_CONFIG: import("zod").ZodOptional<import("zod").ZodString>
  NEXT_PUBLIC_DOPPLER_PROJECT: import("zod").ZodOptional<import("zod").ZodString>
  NEXT_PUBLIC_DOPPLER_ENVIRONMENT: import("zod").ZodOptional<import("zod").ZodString>
  NEXT_PUBLIC_DOPPLER_CONFIG: import("zod").ZodOptional<import("zod").ZodString>
}

export type CreateEnvironmentOptions = {
  env: NodeJS.ProcessEnv
  skipValidation?: boolean
}

/**
 * Parse the provided environment variables (or process.env) and return a typed object
 *
 * This function exists to normalize all environment variables to strings, and to provide runtime type safety for any
 * consumer of environment variables.
 */
export declare function createEnvironment<TSpec extends AnySpec>(
  schema: TSpec,
  opts: CreateEnvironmentOptions
): import("zod").infer<import("zod").ZodObject<TSpec>> &
  import("zod").infer<import("zod").ZodObject<DopplerEnvironmentSpec>>

export declare const variable: import("zod").ZodString
