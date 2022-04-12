import { getLogger } from "@dotkom/logger"
import { createServer } from "./server.js"
import { initUserRepository } from "./repositories/user-repository.js"
import { initUserService } from "./services/user-service.js"
import { ApolloServerExpressConfig } from "apollo-server-express"
import graphqlSchema from "./resolvers/schema.js"
import { Request, Response } from "express"
import prisma from "./repositories/client.js"

const logger = getLogger(import.meta.url)
const client = prisma

// Repositories
const userRepository = initUserRepository(client)

// Services
const userService = initUserService(userRepository)

export const apolloConfig: ApolloServerExpressConfig = {
  schema: graphqlSchema,
  context: (req: Request, res: Response) => {
    return {
      userService,
    }
  },
}

if (process.env.NODE_ENV === "development") {
  const port = 4000
  createServer(apolloConfig).then((server) => server.listen({ port }))
  logger.info(`Started GraphQL server at http://localhost:${port}/graphql 🚀`)
}
