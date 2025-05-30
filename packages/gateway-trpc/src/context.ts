import type { ServiceLayer } from "@dotkomonline/core"
import type { inferAsyncReturnType } from "@trpc/server"

export type CreateContextOptions = {
  // auth0 sub
  principal: string | null

  // auth0 subs
  adminPrincipals: string[]
}

export const createContext = async ({ principal, adminPrincipals }: CreateContextOptions, context: ServiceLayer) => {
  return {
    ...context,
    principal,
    adminPrincipals,
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
