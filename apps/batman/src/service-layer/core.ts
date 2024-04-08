import { S3Client } from "@aws-sdk/client-s3"
import { google } from "googleapis"
import { GmailServiceImpl } from "./gmail-service"
import { S3Repository, StateServiceImpl } from "./state-service"
import { TransactionServiceImpl } from "./transaction-service"
import { ApiGatewayManagementApiClient } from "@aws-sdk/client-apigatewaymanagementapi"
import { AwsWebSockServiceImpl } from "./aws-websocket-service"
import { PubSubServiceImpl } from "./google-pubsub-service"
import { BatmanServiceImpl } from "./batman-service"
import { env } from "./env"
import { DiscordRepository, ObservabilityServiceImpl } from "./observability-service"

export type ServiceLayer = typeof createServiceLayer extends () => Promise<infer T> ? T : never

export const createServiceLayer = async () => {
  const redirect_uris = env.GCP_REDIRECT_URIS.split(",")

  const oauth2Client = new google.auth.OAuth2(env.GCP_OAUTH2_CLIENT_ID, env.GCP_OAUTH2_CLIENT_SECRET, redirect_uris[0])

  oauth2Client.credentials = {
    refresh_token: env.GMAIL_USER_REFRESH_TOKEN,
  }

  google.options({ auth: oauth2Client })

  const gmail = google.gmail({ version: "v1" })
  const gmailService = new GmailServiceImpl(gmail)

  const s3Client = new S3Client({
    region: "eu-north-1",
  })
  const apigtwClient = new ApiGatewayManagementApiClient({
    region: "eu-north-1",
    endpoint: "https://y2nndako0h.execute-api.eu-north-1.amazonaws.com/$default",
  })

  const fileRepository = new S3Repository(s3Client, "batman-state")

  const stateService = new StateServiceImpl(fileRepository, "state.json")
  const transactionService = new TransactionServiceImpl(gmailService, stateService, env.GMAIL_LABEL_ID)
  const awsWebSockService = new AwsWebSockServiceImpl(stateService, apigtwClient)
  const pubSubService = new PubSubServiceImpl()
  const batmanService = new BatmanServiceImpl(
    transactionService,
    stateService,
    awsWebSockService,
    pubSubService,
    gmailService
  )

  const observabilityRepository = new DiscordRepository()
  const observabilityService = new ObservabilityServiceImpl(observabilityRepository)

  return {
    transactionService,
    gmailService,
    stateService,
    awsWebSockService,
    pubSubService,
    batmanService,
    fileRepository,
    observabilityService,
  }
}
