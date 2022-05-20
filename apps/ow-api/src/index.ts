import { getLogger } from "@dotkom/logger"
import { createServer } from "./server.js"
import { initUserRepository } from "./modules/auth/user-repository.js"
import { initUserService } from "./modules/auth/user-service.js"
import { ApolloServerExpressConfig } from "apollo-server-express"
import graphqlSchema from "./graphql/schema.js"
import { Request, Response } from "express"
import { initPostgres } from "../config/postgres.js"
import sanityClient from "./lib/sanity.js"
import { initArticleService } from "./modules/article/artice-service.js"
import { initArticleRepository } from "./modules/article/article-repository.js"

const logger = getLogger(import.meta.url)
const prisma = await initPostgres()
const sanity = sanityClient

// Repositories
const userRepository = initUserRepository(prisma)
const articleRepository = initArticleRepository(sanity)

// Services
const userService = initUserService(userRepository)
const articleService = initArticleService(articleRepository)

export const apolloConfig: ApolloServerExpressConfig = {
  schema: graphqlSchema,
  context: (_req: Request, _res: Response) => {
    return {
      userService,
      articleService,
    }
  },
}

if (process.env.NODE_ENV === "development") {
  const port = Number(process.env.PORT || 4000)
  createServer(apolloConfig).then((server) => server.listen({ port }))
  logger.info(`Started GraphQL server at http://localhost:${port}/graphql 🚀`)
  const articles = await articleService.getSortedArticles(10)
  articles.map((article) => {
    logger.info(article.content)
  })
}
