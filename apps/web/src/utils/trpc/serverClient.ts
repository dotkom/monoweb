"use server"

import { appRouter, createCallerFactory, createContextInner } from "@dotkomonline/gateway-trpc"

const createCaller = createCallerFactory(appRouter)
// TODO: Add a way to get the userId from the request
export const getServerClient = async () => createCaller(createContextInner({ auth: { userId: null } }))
export const getUnauthorizedServerClient = async () => createCaller(createContextInner({ auth: { userId: null } }))
