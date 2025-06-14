import { createEnvironment, variable } from "@dotkomonline/environment"

export const env = createEnvironment(
  {
    DATABASE_URL: variable,
  },
  {
    env: process.env,
    skipValidation: false,
  }
)
