import { config, defineConfiguration } from "@dotkomonline/environment"

export type Configuration = ReturnType<typeof createConfiguration>
export const createConfiguration = () =>
  defineConfiguration({
    ALLOWED_ORIGINS: config(process.env.ALLOWED_ORIGINS, {
      prd: "https://grades.no",
      stg: "https://staging.grades.no",
      dev: "http://localhost:5001",
    }),
    DATABASE_URL: config(process.env.DATABASE_URL),
  })
