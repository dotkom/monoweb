import { z } from "zod"
import dotenv from "dotenv"

const EnvSchema = z.object({
  GCP_OAUTH2_CLIENT_ID: z.string(),
  GCP_OAUTH2_CLIENT_SECRET: z.string(),
  GCP_REDIRECT_URIS: z.string(),
  GMAIL_USER_REFRESH_TOKEN: z.string(),
  GMAIL_LABEL_ID: z.string(),
  TF_VAR_GCLOUD_PROJECT_ID: z.string(),
  TF_VAR_GCLOUD_PUBSUB_SUBSCRIPTION_NAME: z.string(),
  TF_VAR_GCLOUD_PUBSUB_TOPIC_NAME: z.string(),
  TF_VAR_GCLOUD_PUSH_ENDPOINT: z.string(),
  ENV_NOTIFY_URL_ENDPOINT: z.string(),
  ENV_NOTIFIER_DESTINATION: z.string(),
})

const createEnv = () => {
  dotenv.config()

  const env = EnvSchema.safeParse(process.env)

  if (!env.success) {
    throw new Error(`Invalid environment variables: ${env.error.message}`)
  }

  return env.data
}

export const env = createEnv()
