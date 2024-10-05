import { z } from "zod"

/**
 * @template T
 * @param items {Record<T, z.ZodString>}
 * @param env {NodeJS.ProcessEnv}
 */
export function createEnvironment(items, env = process.env) {
  const schema = z.object(items)
  const environment = schema.safeParse(env)
  if (!environment.success) {
    throw new Error(
      `The provided environments do not fulfill the requirements of the schema: ${environment.error.message}`
    )
  }
  return environment.data
}

export const variable = z.string().min(1, "Environment variable value must be at least 1 character long")
