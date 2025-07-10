import { config, defineConfiguration } from "@dotkomonline/environment"

export const env = defineConfiguration({
  EMAIL_ENDPOINT: config(process.env.EMAIL_ENDPOINT),
  EMAIL_TOKEN: config(process.env.EMAIL_TOKEN),
})
