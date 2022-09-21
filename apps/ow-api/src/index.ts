import { getLogger } from "@dotkom/logger"
import { PrismaClient } from "@dotkom/db"
import { initUserRepository } from "./modules/auth/user-repository.js";
import { initUserService } from "./modules/auth/user-service.js";
import { createServer } from "./server.js";
import { CreateExpressContextOptions } from "@trpc/server/dist/adapters/express";
import { inferAsyncReturnType } from "@trpc/server";

const logger = getLogger(import.meta.url)
const client = new PrismaClient()

// Repositories
const userRepository = initUserRepository(client)

// Services
const userService = initUserService(userRepository)

export const createContext = ({
  req,
  res,
}: CreateExpressContextOptions) => ({
  userService
});

export type Context = inferAsyncReturnType<typeof createContext>;

if (process.env.NODE_ENV === "development") {
  const port = Number(process.env.PORT || 4000)
  const server = createServer()
  logger.info(`Started TRPC server at http://localhost:${port}/trpc 🚀`)
  server.listen(port)
}
