import type { inferAsyncReturnType } from "@trpc/server"
import { type CreateNextContextOptions } from "@trpc/server/adapters/next"
import { getAuth } from "@clerk/nextjs/server"
import { initServices } from "./modules/services"
import { getServerSession } from "@dotkomonline/auth"

type AuthContextProps = {
  auth: {
    userId: string
    username: string | null | undefined
    email: string | null | undefined
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
  if (clerkAuth.user) {
    const user = clerkAuth.user
    return createContextInner({
      auth: {
        username: user.username,
        userId: user.id,
        email: user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress,
      },
    })
  }
  // corss site through ory hydra
  const auth = await getServerSession(opts)
  if (auth?.user) {
    return createContextInner({
      auth: {
        username: auth.user.name,
        userId: auth.user.id,
        email: auth.user.email,
      },
    })
  }

  // Not authed
  return createContextInner({ auth: null })
}

export type Context = inferAsyncReturnType<typeof createContext>
