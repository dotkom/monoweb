import { type inferAsyncReturnType } from "@trpc/server"
import { type CreateNextContextOptions } from "@trpc/server/adapters/next"
import { createServiceLayer } from "@dotkomonline/core"
import { kysely } from "@dotkomonline/db"
import { authOptions } from "@dotkomonline/auth/src/web.app"
import { getServerSession } from "next-auth"

interface AuthContextProps {
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
  const session = await getServerSession(opts.req, opts.res, authOptions)
  if (session !== null) {
    return createContextInner({
      auth: {
        userId: session.user.id,
      },
    })
  }
  return createContextInner({ auth: null })
}

export type Context = inferAsyncReturnType<typeof createContext>
