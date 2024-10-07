import * as Sentry from "@sentry/aws-serverless"
import { nodeProfilingIntegration } from "@sentry/profiling-node"
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Handler } from "aws-lambda"
import { createExternalClients, createServiceLayer } from "./core"
import { env } from "./env"

Sentry.init({
  dsn: "https://a07a847a3bbab26aac0ea417edcbc7f2@o4504113989287936.ingest.us.sentry.io/4508080738467840",
  integrations: [nodeProfilingIntegration()],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions

  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
})

export const handler: Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2> = Sentry.wrapHandler(async (event) => {
  try {
    const { gmailClient, slackClient } = await createExternalClients({
      googleClientId: env.GOOGLE_CLIENT_ID,
      googleClientSecret: env.GOOGLE_CLIENT_SECRET,
      googleRedirectUrl: env.GOOGLE_REDIRECT_URL,
      slackApiToken: env.SLACK_API_TOKEN,
      googleRefreshToken: env.GOOGLE_OAUTH_REFRESH_TOKEN,
    })

    const { emailSlackService } = await createServiceLayer({
      slackClient,
      gmailClient,
    })

    await emailSlackService.processPending(
      env.GMAIL_LABEL_NAME,
      env.SLACK_CHANNEL_ID,
      env.BLOCKED_SENDERS.split(","),
      env.BLOCKED_RECEIVERS.split(",")
    )

    return { statusCode: 200 }
  } catch (err) {
    Sentry.captureException(err)
    return { statusCode: 500 }
  }
})
