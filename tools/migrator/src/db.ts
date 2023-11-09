import { createKysely } from "@dotkomonline/db"
import { env } from "@dotkomonline/env"

export const db = createKysely(env)
