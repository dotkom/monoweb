import { createProxyRoute } from "@dotkomonline/proxy-nextjs"

const handler = createProxyRoute({
  mountPath: "/api/trpc",
  apiEndpoint: "http://localhost:4444/api/trpc",
})

export const GET = handler
export const POST = handler
