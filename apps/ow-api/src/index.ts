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
import { InsertPunishment } from "./modules/punishment/punishment.js"
import { calculateEndDate } from "./modules/punishment/tools/punishment-tools.js"

const logger = getLogger(import.meta.url)
const client = await initPostgres()

// Repositories
const userRepository = initUserRepository(client)
const punishmentRepository = initPunishmentRepository(client)

// Services
const userService = initUserService(userRepository)
const punishmentService = initPunishmentService(punishmentRepository)

const setPunishments = async () => {
  const punishment: InsertPunishment = {
    givenDate: new Date(),
    rulsetID: "3ba59ac4-76a5-4b75-a3ed-cdcc68c05e03",
    type: "MARK",
    userID: "0e8c42c9-c68b-4e13-959c-84bf6d644a9f",
  }

  await punishmentService.registerPunishment(punishment)
  await punishmentService.registerPunishment(punishment)
  await punishmentService.registerPunishment(punishment)
  await punishmentService.registerPunishment(punishment)
}

const fixPunishments = async () => {
  const newPunishments = await punishmentService.fixUserPunishmentsDate("0e8c42c9-c68b-4e13-959c-84bf6d644a9f")
}

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
  //setPunishments()
  //fixPunishments()
}
