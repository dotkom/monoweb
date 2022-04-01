import { ApolloServer, ApolloServerExpressConfig } from "apollo-server-express";
import express from "express";

export const createServer = async (apolloConfig: ApolloServerExpressConfig) => {
  const app = express();
  const server = new ApolloServer(apolloConfig);
  await server.start();
  server.applyMiddleware({ app });
  return app;
};
