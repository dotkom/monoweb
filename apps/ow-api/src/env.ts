import dotenv from "dotenv"
import { z } from "zod"

dotenv.config({ path: "../../.env" })

const envSchame = z.object({
  DB_HOST: z.string(),
  DB_PORT: z.string().transform(Number),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
})

const parsed = envSchame.safeParse(process.env)

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", JSON.stringify(parsed.error.format(), null, 4))
  process.exit(1)
}

export const env = parsed.data
