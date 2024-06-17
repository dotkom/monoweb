"use server"

import { appRouter, createCallerFactory, createContext } from "@dotkomonline/gateway-trpc"

const createCaller = createCallerFactory(appRouter)
// TODO: Add a way to get the userId from the request
export const getServerClient = async () => createCaller(await createContext({ principal: null }))
export const getUnauthorizedServerClient = async () => createCaller(await createContext({ principal: null }))
