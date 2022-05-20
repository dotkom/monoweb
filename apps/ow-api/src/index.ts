import { getLogger } from "@dotkom/logger"
import { createServer } from "./server.js"
import { initUserRepository } from "./modules/auth/user-repository.js"
import { initUserService } from "./modules/auth/user-service.js"
import { ApolloServerExpressConfig } from "apollo-server-express"
import graphqlSchema from "./graphql/schema.js"
import { Request, Response } from "express"
import { initPostgres } from "../config/postgres.js"
import { initPunishmentRepository } from "./modules/punishment/punishment-repository.js"
import { initPunishmentService } from "./modules/punishment/punishment-service.js"

const logger = getLogger(import.meta.url)
const client = await initPostgres()

// Repositories
const userRepository = initUserRepository(client)
const punishmentRepository = initPunishmentRepository(client)

// Services
const userService = initUserService(userRepository)
const punishmentService = initPunishmentService(punishmentRepository)

export const apolloConfig: ApolloServerExpressConfig = {
  schema: graphqlSchema,
  context: (_req: Request, _res: Response) => {
    return {
      userService,
    }
  },
}

if (process.env.NODE_ENV === "development") {
  const port = Number(process.env.PORT || 4000)
  createServer(apolloConfig).then((server) => server.listen({ port }))
  logger.info(`Started GraphQL server at http://localhost:${port}/graphql 🚀`)
  const punishment = await punishmentService.getUserPunishments("09853c50-9a74-4171-befb-d3876bd2eb91")
  punishment.map((punishment) => {
    logger.info(punishment.type)
  })
}
