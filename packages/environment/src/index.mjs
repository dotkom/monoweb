import { z } from "zod"

/**
 * @template T
 * @param variables {Record<T, z.ZodString>}
 * @param opts
 */
export function createEnvironment(variables, opts) {
  const isClient = typeof window !== "undefined"
  let items = variables
  if (isClient) {
    const clientItems = Object.entries(items).filter(([key]) => key.startsWith("NEXT_PUBLIC_"))
    items = Object.fromEntries(clientItems)
  }
  const schema = z.object(items).extend({
    DOPPLER_PROJECT: z.string().optional(),
    DOPPLER_CONFIG: z.string().optional(),
    DOPPLER_ENVIRONMENT: z.string().optional(),
    NEXT_PUBLIC_DOPPLER_PROJECT: z.string().optional(),
    NEXT_PUBLIC_DOPPLER_CONFIG: z.string().optional(),
    NEXT_PUBLIC_DOPPLER_ENVIRONMENT: z.string().optional(),
  })

  const environment = schema.safeParse(opts.env)
  if (opts.skipValidation) {
    // If we did successfully parse, we might as well return them. Otherwise, we're just going to hand the raw
    // environment variables back.
    return environment.data ?? opts.env
  }
  if (!environment.success) {
    throw new Error(
      `The provided environments do not fulfill the requirements of the schema: ${environment.error.message}`
    )
  }
  return environment.data
}

export const variable = z.string().min(1, "Environment variable value must be at least 1 character long")
