import { config, defineConfiguration } from "@dotkomonline/environment"

export const env = defineConfiguration({
  BACKEND_HOST: config(process.env.BACKEND_HOST, {
    prd: "https://api.grades.no",
    stg: "https://staging.api.grades.no",
    dev: "http://localhost:5555",
  }),
  NEXT_PUBLIC_ORIGIN: config(process.env.NEXT_PUBLIC_ORIGIN, {
    prd: "https://grades.no",
    stg: "https://staging.grades.no",
    dev: "http://localhost:5000",
  }),
  NEXT_PUBLIC_BACKEND_HOST: config(process.env.NEXT_PUBLIC_BACKEND_HOST, {
    prd: "https://api.grades.no",
    stg: "https://staging.api.grades.no",
    dev: "http://localhost:5555",
  }),
  NEXT_PUBLIC_HOME_URL: config(process.env.NEXT_PUBLIC_HOME_URL, "/"),
})
