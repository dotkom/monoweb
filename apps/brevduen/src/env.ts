import { config, defineConfiguration } from "@dotkomonline/environment"

export const env = defineConfiguration({
  EMAIL_TOKEN: config(process.env.EMAIL_TOKEN),
})
