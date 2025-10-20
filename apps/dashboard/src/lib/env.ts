import { config, defineConfiguration } from "@dotkomonline/environment"

export const env = defineConfiguration({
  AUTH0_CLIENT_ID: config(process.env.AUTH0_CLIENT_ID),
  AUTH0_CLIENT_SECRET: config(process.env.AUTH0_CLIENT_SECRET),
  AUTH0_ISSUER: config(process.env.AUTH0_ISSUER),
  AUTH0_AUDIENCES: config(process.env.AUTH0_AUDIENCES),
  AUTH_SECRET: config(process.env.AUTH_SECRET),
  NEXT_PUBLIC_ORIGIN: config(process.env.NEXT_PUBLIC_ORIGIN, {
    prd: "https://dashboard.online.ntnu.no",
    stg: "https://staging.dashboard.online.ntnu.no",
    dev: "http://localhost:3002",
  }),
  NEXT_PUBLIC_RPC_HOST: config(process.env.NEXT_PUBLIC_RPC_HOST, {
    prd: "https://rpc.online.ntnu.no",
    stg: "https://staging.rpc.online.ntnu.no",
    dev: "http://localhost:4444",
  }),
  RPC_HOST: config(process.env.RPC_HOST, {
    prd: "https://rpc.online.ntnu.no",
    stg: "https://staging.rpc.online.ntnu.no",
    dev: "http://localhost:4444",
  }),
  NEXT_PUBLIC_WEB_URL: config(process.env.NEXT_PUBLIC_WEB_URL, {
    prd: "https://online.ntnu.no",
    stg: "https://staging.online.ntnu.no",
    dev: "http://localhost:3000",
  }),
  // Feature toggle for uploading files to S3. If disabled, uploads are faked and replaced with static URL
  S3_UPLOAD_ENABLED: config(process.env.S3_UPLOAD_ENABLED, "true"),
  AWS_CLOUDFRONT_URL: config(process.env.AWS_CLOUDFRONT_URL, {
    prd: "https://cdn.online.ntnu.no",
    stg: "https://cdn.staging.online.ntnu.no",
    dev: "https://cdn.staging.online.ntnu.no",
  }),
})
