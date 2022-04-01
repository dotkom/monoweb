import { getLogger } from "ow-logger";
import { createServer } from "./server.js";
import { initPostgres } from "./database/postgres.js";
import { initUserRepository } from "./repositories/user-repository.js";
import { initUserverService } from "./services/user-service.js";
import { ApolloServerExpressConfig } from "apollo-server-express";
import graphqlSchema from "./resolvers/schema.js";
import { Request, Response } from "express";

const logger = getLogger("server");
const prisma = await initPostgres();
// Repositories
const userRepository = initUserRepository(prisma);

// Services
const userService = initUserverService(userRepository);

export const apolloConfig: ApolloServerExpressConfig = {
  schema: graphqlSchema,
  context: (req: Request, res: Response) => {
    return { userService };
  },
};

if (process.env.NODE_ENV === "development") {
  const port = 4000;
  createServer(apolloConfig).then((server) => server.listen({ port }));
  logger.info(`Started GraphQL server at http://localhost:${port}/graphql 🚀`);
}
