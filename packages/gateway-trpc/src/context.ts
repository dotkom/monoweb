import { type ServiceLayerOptions, createServiceLayer } from "@dotkomonline/core"
import type { inferAsyncReturnType } from "@trpc/server"

export type CreateContextOptions = {
  // auth0 sub
  principal: string | null

  // auth0 subs
  adminPrincipals: string[]
} & ServiceLayerOptions

export const createContext = async ({ principal, adminPrincipals, ...opts }: CreateContextOptions) => {
  const services = await createServiceLayer(opts)
  return {
    ...services,
    principal,
    adminPrincipals,
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
