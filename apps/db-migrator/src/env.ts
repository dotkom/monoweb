import { z } from "zod"

import { logger } from "."

const envSchema = z.object({
  DATABASE_URL: z.string(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  logger.error("❌ Invalid environment variables:", JSON.stringify(parsed.error.format(), null, 4))
  process.exit(1)
}

export const env = parsed.data
