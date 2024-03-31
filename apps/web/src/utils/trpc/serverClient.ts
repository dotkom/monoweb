"use server"

import { appRouter, createCallerFactory, createContext, createUnauthorizedContext } from "@dotkomonline/gateway-trpc"

const createCaller = createCallerFactory(appRouter)
export const getServerClient = async () => createCaller(await createContext())
export const getUnauthorizedServerClient = async () => createCaller(await createUnauthorizedContext())
