import { ApolloServer } from "apollo-server-lambda"
import { Handler } from "aws-lambda"
import { apolloConfig } from "./"

const createHandler = async () => {
  const server = new ApolloServer(apolloConfig)
  return server.createHandler()
}

export const graphqlHandler: Handler = (event, context, callback) => {
  createHandler().then((handler) => handler(event, context, callback))
}
