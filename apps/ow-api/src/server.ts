import { createExpressMiddleware } from "@trpc/server/adapters/express";
import express from "express";
import { appRouter } from "./trpc.js";
import { createContext } from "./index.js";

export const createServer = () => {
  const app = express()
  // TODO: add express cors extension here
  const handler = createExpressMiddleware({
    router: appRouter,
    createContext,
  })

  app.use('/trpc', handler)
  return app
}
