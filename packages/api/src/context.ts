import type { inferAsyncReturnType } from "@trpc/server"
import { type CreateNextContextOptions } from "@trpc/server/adapters/next"
import { getAuth } from "@clerk/nextjs/server"
import { initServices } from "./modules/services"
import { getServerSession } from "@dotkomonline/auth"

type AuthContextProps = {
  auth: {
    userId: string
  } | null
}
export const createContextInner = async (opts: AuthContextProps) => {
  const services = initServices()
  return {
    ...services,
    auth: opts.auth,
  }
}

export const createContext = async (opts: CreateNextContextOptions) => {
  const clerkAuth = getAuth(opts.req)
  // samesite through clerk
  if (clerkAuth.userId) {
    return createContextInner({
      auth: {
        userId: clerkAuth.userId,
      },
    })
  }
  // corss site through ory hydra
  const auth = await getServerSession(opts)
  if (auth?.user) {
    return createContextInner({
      auth: {
        userId: auth.user.id,
      },
    })
  }

  // Not authed
  return createContextInner({ auth: null })
}

export type Context = inferAsyncReturnType<typeof createContext>
