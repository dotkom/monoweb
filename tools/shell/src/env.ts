import { config, defineConfiguration } from "@dotkomonline/environment"

export const env = defineConfiguration({
  DATABASE_URL: config(process.env.DATABASE_URL),
})
