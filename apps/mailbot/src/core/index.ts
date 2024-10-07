import { gmail } from "@googleapis/gmail"
import type { Env } from "../env"
import { EmailSlackService } from "./MailBotService"
import { SlackClient } from "./SlackClient"
import { GmailClient } from "./gmail-client"
import { GoogleAuthorizer } from "./gmail-client/GoogleAuthorizer"

interface ServiceLayerOptions {
  slackClient: SlackClient
  gmailClient: GmailClient
}

export const createServiceLayer = async ({ slackClient, gmailClient }: ServiceLayerOptions) => {
  const emailSlackService = new EmailSlackService(slackClient, gmailClient)

  return { emailSlackService }
}

export const fromEnv = (env: Env): ExternalClientsOptions => ({
  googleClientId: env.GOOGLE_CLIENT_ID,
  googleClientSecret: env.GOOGLE_CLIENT_SECRET,
  googleRedirectUrl: env.GOOGLE_REDIRECT_URL,
  slackApiToken: env.SLACK_API_TOKEN,
  googleRefreshToken: env.GOOGLE_OAUTH_REFRESH_TOKEN,
})

interface ExternalClientsOptions {
  googleClientId: string
  googleClientSecret: string
  googleRedirectUrl: string

  slackApiToken: string

  googleRefreshToken: string
}

export const createExternalClients = async ({
  googleClientId,
  googleClientSecret,
  googleRedirectUrl,
  slackApiToken,
  googleRefreshToken,
}: ExternalClientsOptions) => {
  const slackClient = new SlackClient(slackApiToken)

  const googleAuthorizer = new GoogleAuthorizer(googleClientId, googleClientSecret, googleRedirectUrl)

  const oauthClient = await googleAuthorizer.authorizeOauthClientWithUserRefreshToken(googleRefreshToken)
  const gmailApiClient = gmail({ version: "v1", auth: oauthClient })

  const gmailClient = new GmailClient(gmailApiClient)

  return { slackClient, gmailClient }
}
