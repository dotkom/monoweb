import { createServiceLayer } from "@dotkomonline/core"
import { kysely } from "@dotkomonline/db"
import type { inferAsyncReturnType } from "@trpc/server"

interface AuthContextProps {
  principal: string | null
}

export const createContext = async (opts: AuthContextProps) => {
  const services = await createServiceLayer({ db: kysely })
  return {
    ...services,
    principal: opts.principal,
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
