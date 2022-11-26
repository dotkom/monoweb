import { z } from "zod"

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  DATABASE_URL: z.string(),
  HYDRA_ADMIN_URL: z.string(),
  NEXTAUTH_URL: z.string(),
  NEXTAUTH_CLIENT_ID: z.string(),
  NEXTAUTH_SECRET: z.string(),
})

// const clientEnvSchema = z.object({})

/**
 * @type {{ [k in keyof z.infer<typeof serverEnvSchema>]: z.infer<typeof serverEnvSchema>[k] | undefined }}
 */
const _serverEnv = {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  HYDRA_ADMIN_URL: process.env.HYDRA_ADMIN_URL,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_CLIENT_ID: process.env.NEXTAUTH_CLIENT_ID,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
}
console.log(_serverEnv)

const serverEnv = serverEnvSchema.safeParse(_serverEnv)

if (!serverEnv.success) {
  console.error("❌ Invalid environment variables\n" + serverEnv.error)
  throw new Error("Invalid environment variables\n" + serverEnv.error)
}
// const clientEnv = clientEnvSchema.safeParse(process.env)
// if (!clientEnv.success) {
//   console.error("❌ Invalid environment variables")
//   throw new Error("Invalid environment variables")
// }

export const env = { ...serverEnv.data }
