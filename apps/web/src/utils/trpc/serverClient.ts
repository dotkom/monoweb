"use server"

import { authOptions } from "@dotkomonline/auth/src/web.app"
import { appRouter, createCallerFactory, createContextInner } from "@dotkomonline/gateway-trpc"
import { getServerSession } from "next-auth"

const createCaller = createCallerFactory(appRouter)

export const getServerClient = async () => {
  const session = await getServerSession(authOptions)

  return createCaller(
    await createContextInner({
      auth: session === null ? null : { userId: session.user.id },
    })
  )
}
export const getUnauthorizedServerClient = async () => createCaller(await createContextInner({ auth: null }))
