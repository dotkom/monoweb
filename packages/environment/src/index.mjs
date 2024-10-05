import { z } from "zod"

/**
 * @template T
 * @param variables {Record<T, z.ZodString>}
 * @param env {NodeJS.ProcessEnv}
 */
export function createEnvironment(variables, env = process.env) {
  const isClient = typeof window !== "undefined"
  let items = variables
  if (isClient) {
    const clientItems = Object.entries(items).filter(([key]) => key.startsWith("NEXT_PUBLIC_"))
    items = Object.fromEntries(clientItems)
  }
  const schema = z.object(items)

  const environment = schema.safeParse(env)
  const skipValidation = process.env.DOCKER_BUILD === "1"
  if (!environment.success && !skipValidation) {
    throw new Error(
      `The provided environments do not fulfill the requirements of the schema: ${environment.error.message}`
    )
  }
  return environment.data
}

export const variable = z.string().min(1, "Environment variable value must be at least 1 character long")
