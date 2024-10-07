import { createEnvironment, variable } from "@dotkomonline/environment"

export const env = createEnvironment({
  SLACK_API_TOKEN: variable,

  GOOGLE_CLIENT_ID: variable,
  GOOGLE_CLIENT_SECRET: variable,
  GOOGLE_REDIRECT_URL: variable,

  GOOGLE_OAUTH_REFRESH_TOKEN: variable,

  GMAIL_LABEL_NAME: variable,
  SLACK_CHANNEL_ID: variable,
  BLOCKED_SENDERS: variable,
  BLOCKED_RECEIVERS: variable,

  SENTRY_DSN: variable,
})

export type Env = typeof env
