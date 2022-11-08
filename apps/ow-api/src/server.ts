import cors from "cors"
import express from "express"

import { createExpressMiddleware } from "@trpc/server/adapters/express"

import { createContext } from "./context"
import { appRouter } from "./router.js"

export const createServer = () => {
  const app = express()
  app.use(cors())

  // TODO: add express cors extension here
  const handler = createExpressMiddleware({
    router: appRouter,
    createContext,
  })

  app.use("/trpc", handler)
  return app
}
