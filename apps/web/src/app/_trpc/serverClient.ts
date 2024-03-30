import { appRouter, createCallerFactory, createContext } from "@dotkomonline/gateway-trpc"

const createCaller = createCallerFactory(appRouter);

export const serverClient = createCaller(await createContext())