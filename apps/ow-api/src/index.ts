import { PrismaClient } from "@dotkomonline/db"
import { getLogger } from "@dotkomonline/logger"

import { inferAsyncReturnType } from "@trpc/server"
import { CreateExpressContextOptions } from "@trpc/server/dist/adapters/express"

import { initUserRepository } from "./modules/auth/user-repository"
import { initUserService } from "./modules/auth/user-service"
import { initEventRepository } from "./modules/event/event-repository.js"
import { initEventService } from "./modules/event/event-service.js"
import { createServer } from "./server"

const logger = getLogger(import.meta.url)
const client = new PrismaClient()

// Repositories
const userRepository = initUserRepository(client)
const eventRepository = initEventRepository(client)

// Services
const userService = initUserService(userRepository)
const eventService = initEventService(eventRepository)

export const createContext = (_opts: CreateExpressContextOptions) => ({
  userService,
  eventService,
})

export type Context = inferAsyncReturnType<typeof createContext>

if (process.env.NODE_ENV === "development") {
  const port = Number(process.env.API_PORT || 4000)
  const server = createServer()
  logger.info(`Started TRPC server at http://localhost:${port}/trpc 🚀`)
  server.listen(port)
}
