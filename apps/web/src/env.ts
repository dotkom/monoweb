import { config, defineConfiguration } from "@dotkomonline/environment"

export const env = defineConfiguration({
  AUTH0_CLIENT_ID: config(process.env.AUTH0_CLIENT_ID),
  AUTH0_CLIENT_SECRET: config(process.env.AUTH0_CLIENT_SECRET),
  AUTH0_ISSUER: config(process.env.AUTH0_ISSUER),
  AUTH0_AUDIENCES: config(process.env.AUTH0_AUDIENCES),
  AUTH_SECRET: config(process.env.AUTH_SECRET),
  RPC_HOST: config(process.env.RPC_HOST, {
    prd: "https://rpc.online.ntnu.no",
    stg: "https://staging.rpc.online.ntnu.no",
    dev: "http://localhost:4444",
  }),
  SIGNING_KEY: config(process.env.SIGNING_KEY),
  NEXT_PUBLIC_ORIGIN: config(process.env.NEXT_PUBLIC_ORIGIN, {
    prd: "https://online.ntnu.no",
    stg: "https://staging.online.ntnu.no",
    dev: "http://localhost:3000",
  }),
  NEXT_PUBLIC_RPC_HOST: config(process.env.NEXT_PUBLIC_RPC_HOST, {
    prd: "https://rpc.online.ntnu.no",
    stg: "https://staging.rpc.online.ntnu.no",
    dev: "http://localhost:4444",
  }),
  NEXT_PUBLIC_DASHBOARD_URL: config(process.env.NEXT_PUBLIC_DASHBOARD_URL, {
    prd: "https://dashboard.online.ntnu.no",
    stg: "https://staging.dashboard.online.ntnu.no",
    dev: "http://localhost:3002",
  }),
  NEXT_PUBLIC_HOME_URL: config(process.env.NEXT_PUBLIC_HOME_URL, "/"),
})
