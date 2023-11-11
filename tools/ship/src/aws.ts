import { ECRClient, GetAuthorizationTokenCommand } from "@aws-sdk/client-ecr"
import invariant from "tiny-invariant"
import { LambdaClient, UpdateFunctionCodeCommand } from "@aws-sdk/client-lambda"
import { type Context } from "./config"
import { getResolvedRepositoryTag } from "./docker"
import { logger } from "./logger"

export interface ClientContext {
  ecr: ECRClient
  lambda: LambdaClient
}

export const createClientContext = async (): Promise<ClientContext> => ({
  ecr: new ECRClient({ region: "eu-north-1" }),
  lambda: new LambdaClient({ region: "eu-north-1" }),
})

export type ECRCredential = Awaited<ReturnType<typeof getEcrAuthorizationToken>>

export const getEcrAuthorizationToken = async (client: ClientContext) => {
  const cmd = new GetAuthorizationTokenCommand({})
  const response = await client.ecr.send(cmd)

  invariant(response.authorizationData !== undefined, "Expected authorization data not to be undefined")
  invariant(response.authorizationData.length !== 0, "Expected authorization data to include at least one credential")

  const token = response.authorizationData[0].authorizationToken
  const endpoint = response.authorizationData[0].proxyEndpoint

  invariant(token !== undefined, "Token must not be undefined")
  invariant(endpoint !== undefined, "Proxy endpoint must not be undefined")

  return { token, endpoint }
}

export const updateFunctionImage = async (client: ClientContext, context: Context) => {
  const cmd = new UpdateFunctionCodeCommand({
    FunctionName: context.environment.functionName,
    ImageUri: getResolvedRepositoryTag(context),
  })
  const response = await client.lambda.send(cmd)
  logger.info(`Function image update status: ${response.State}`)
}
