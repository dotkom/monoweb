import { ApolloServer, ApolloServerExpressConfig } from "apollo-server-express"
import express from "express"

const origin = ["https://studio.apollographql.com", "http://localhost:3000"]

export const createServer = async (apolloConfig: ApolloServerExpressConfig) => {
  const app = express()
  const server = new ApolloServer(apolloConfig)
  await server.start()
  server.applyMiddleware({
    app,
    cors: {
      origin,
      credentials: true,
    },
  })
  return app
}
