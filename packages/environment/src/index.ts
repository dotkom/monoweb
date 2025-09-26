import { z } from "zod"

export type DefaultVariable<TSpec extends z.ZodSchema> =
  | z.infer<TSpec>
  | {
      prd: z.infer<TSpec>
      stg: z.infer<TSpec>
      dev: z.infer<TSpec>
    }

/** The type of process.env[K] */
export type RawEnvironmentVariableValue = string | undefined

export type DefaultEnvironmentValueSchema = z.ZodString

/**
 * Create a single configuration variable with a global OR per-environment default value.
 *
 * If, and only if the `value` is undefined, the default value will be used. This is useful for providing a default
 * value for a variable.
 *
 * The caller can optionally provide a zod validator for the value. If not provided, the default validator is
 * `z.string()`.
 *
 * @example
 * ```ts
 * // Will fail if process.env.REQUIRED_STRING is not set
 * const requiredString = config(process.env.REQUIRED_STRING)
 * // Will use the default value "default" if process.env.OPTIONAL_STRING is not set
 * const optionalString = config(process.env.OPTIONAL_STRING, "default")
 *
 * // This value will be coerced to number, because it uses a custom zod validator
 * const optionalCoerceNumber = config(
 *   process.env.OPTIONAL_COERCE_NUMBER,
 *   "42",
 *   z.coerce.number().min(0, "Number must be at least 0")
 * )
 *
 * // This value will pick the default value based on the environment
 * const optionalEnvDefault = config(
 *   process.env.OPTIONAL_ENV_DEFAULT,
 *   {
 *     prd: "production-default",
 *     stg: "staging-default",
 *     dev: "development-default",
 *   },
 * )
 *
 * // This value have null as its default value, and the inferred type will be `string | null`
 * const optionalNull = config(
 *  process.env.OPTIONAL_NULL,
 *  null,
 * )
 * ```
 */
export function config<TSpec extends z.ZodSchema = DefaultEnvironmentValueSchema>(
  value: string | undefined,
  defaultValue?: DefaultVariable<TSpec>,
  spec?: TSpec
): z.infer<TSpec>
export function config<TSpec extends z.ZodSchema = DefaultEnvironmentValueSchema>(
  value: string | undefined,
  defaultValue: z.infer<TSpec> | null,
  spec?: TSpec
): z.infer<TSpec> | null

export function config<TSpec extends z.ZodSchema = DefaultEnvironmentValueSchema>(
  value: z.infer<TSpec> | undefined,
  defaultValue?: DefaultVariable<TSpec> | null,
  spec?: TSpec
): z.infer<TSpec> {
  // If there was no spec validator provided, we default to string, unless the variable is nullable.
  const validator = spec ?? (defaultValue === null ? z.string().nullable() : z.string())

  function getDefaultValue(env: string): z.infer<TSpec> | undefined {
    if (typeof defaultValue === "object" && defaultValue !== null) {
      if (env in defaultValue) {
        return defaultValue[env as keyof typeof defaultValue]
      }
      throw new Error(`Default value object did not contain value for environment ${env}`)
    }
    return defaultValue ?? (null as unknown as z.infer<TSpec>)
  }
  // If we are running on the client in a Next.js application, we ignore all validation because the server environment
  // variables will be set to undefined.
  if (typeof window !== "undefined" && value === undefined && defaultValue === undefined) {
    return undefined as unknown as z.infer<TSpec>
  }
  // DOPPLER_ENVIRONMENT is available at build-time in all containers, and NEXT_PUBLIC_DOPPLER_ENVIRONMENT is available
  // during build for client-side Next.js applications. NOTE: For NEXT_PUBLIC_DOPPLER_ENVIRONMENT to work, the
  // Dockerfile must set this value from `DOPPLER_ENVIRONMENT` which comes from Doppler.
  const environment = process.env.NEXT_PUBLIC_DOPPLER_ENVIRONMENT ?? process.env.DOPPLER_ENVIRONMENT ?? "dev"
  const val = value || getDefaultValue(environment)
  // If the `getDefaultValue` function returned undefined, then there was no default value to use, and the value must
  // be defined. Therefor this should result in an error being thrown.
  if (val === undefined) {
    // Technically, this could be failing at the parse step below, but this is a better error message to provide to the
    // caller.
    throw new Error(
      `The environment variable value for ${environment} is undefined, and no default value was provided.`
    )
  }
  // Otherwise, we validate the variable against the provided zod validator.
  const result = validator.safeParse(val)
  if (!result.success) {
    throw new Error(
      `The provided environment variable value for ${environment} does not fulfill the requirements of the schema: ${result.error.message}`
    )
  }
  return result.data
}

/** Identity function to infer the type of the provided spec. */
export function defineConfiguration<const TSpec>(spec: TSpec): TSpec {
  return spec
}
