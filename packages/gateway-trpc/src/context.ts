import { type inferAsyncReturnType } from "@trpc/server"
import { createServiceLayer } from "@dotkomonline/core"
import { kysely } from "@dotkomonline/db"
import { authOptions } from "@dotkomonline/auth/src/web.app"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { CreateNextContextOptions } from "@trpc/server/dist/adapters/next"
import { NextApiRequest, NextApiResponse } from "next"

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

export const createContext = async () => {
  const session = await getServerSession();
  if (session !== null) {
    return await createContextInner({
      auth: {
        userId: session.user.id,
      },
    })
  }
  return createContextInner({ auth: null })
}

export const createUnauthorizedContext = async () => await createContextInner({ auth: null })

export type Context = inferAsyncReturnType<typeof createContext>
