"use server"

import { appRouter, createCallerFactory, createContextInner } from "@dotkomonline/gateway-trpc"
import { getServerSession } from "next-auth"

const createCaller = createCallerFactory(appRouter)

export const getServerClient = async () => {
  const session = await getServerSession()
  return createCaller(
    await createContextInner({
      auth: session === null ? null : { userId: session.user.id },
    })
  )
}
export const getUnauthorizedServerClient = async () => createCaller(await createContextInner({ auth: null }))
