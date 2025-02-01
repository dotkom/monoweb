import { z } from "zod"

if (typeof window !== "undefined") {
  throw new Error("The @dotkomonline/environment package should not be imported on the client side. Use process.env directly.");
}

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
  const skipValidation = process.env.DOCKER_BUILD === "1" || process.env.CI !== undefined
  if (skipValidation) {
    return environment.data ?? {}
  }
  if (!environment.success) {
    throw new Error(
      `The provided environments do not fulfill the requirements of the schema: ${environment.error.message}`
    )
  }
  return environment.data
}

export const variable = z.string().min(1, "Environment variable value must be at least 1 character long")
