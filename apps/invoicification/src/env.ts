import { createEnvironment, variable } from "@dotkomonline/environment"

export const env = createEnvironment({
  EMAIL_ENDPOINT: variable,
  EMAIL_TOKEN: variable,
})
