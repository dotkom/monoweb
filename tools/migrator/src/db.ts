import { createKysely } from "@dotkomonline/db"
import { env } from "./env"

export const db = createKysely(env.DATABASE_URL, env.AWS_RDS_CERTIFICATE_AUTHORITY)
