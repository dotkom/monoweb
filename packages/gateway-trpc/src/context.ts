import type { inferAsyncReturnType } from "@trpc/server"
import { type CreateNextContextOptions } from "@trpc/server/adapters/next"
import { createServiceLayer } from "@dotkomonline/core"
import { kysely } from "@dotkomonline/db"

type AuthContextProps = {
  auth: {
    userId: string
  } | null
}

export const createContextInner = async (opts: AuthContextProps) => {
  const services = await createServiceLayer({ db: kysely })
  return {
    ...services,
    auth: opts.auth,
  }
}

export const createContext = async (opts: CreateNextContextOptions) => {
  return createContextInner({ auth: null })
}

export type Context = inferAsyncReturnType<typeof createContext>
