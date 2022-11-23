import { z } from "zod"

import { logger } from "."

const envSchema = z.object({
  DB_HOST: z.string(),
  DB_PORT: z.string().transform(Number),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  logger.error("❌ Invalid environment variables:", JSON.stringify(parsed.error.format(), null, 4))
  process.exit(1)
}

export const env = parsed.data
