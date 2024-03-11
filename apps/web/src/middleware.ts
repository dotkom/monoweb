import { createMiddleware } from "@dotkomonline/jwt-nextjs"
import { env } from "@dotkomonline/env"

export const middleware = createMiddleware({
  issuer: env.GTX_AUTH0_ISSUER,
  clientId: env.GTX_AUTH0_CLIENT_ID,
  clientSecret: env.GTX_AUTH0_CLIENT_SECRET,
  gatewayUrl: env.NEXT_PUBLIC_NODE_ENV === "production" ? "https://web.online.ntnu.no" : "http://localhost:3000",
})

export const config = {
  matcher: ["/api/proxy/trpc/:path*"],
}
