import type { FastifyInstance, FastifyRequest } from "fastify"

const authenticatedSubscriptionRequestPaths = new Set(["/api/trpc/notification.onNewNotification"])

type ValidateAuthorizationHeader = (authorizationHeader: string) => Promise<boolean>

function requiresSubscriptionAuthentication(request: FastifyRequest): boolean {
  if (request.method !== "GET") {
    return false
  }

  const requestPath = new URL(request.url, "http://localhost").pathname

  if (!authenticatedSubscriptionRequestPaths.has(requestPath)) {
    return false
  }

  return true
}

export function registerAuthenticatedSubscriptionGuard(
  server: FastifyInstance,
  validateAuthorizationHeader: ValidateAuthorizationHeader
): void {
  server.addHook("onRequest", async (request, reply) => {
    if (!requiresSubscriptionAuthentication(request)) {
      return
    }

    const authorizationHeader = request.headers.authorization
    const hasValidCredentials =
      authorizationHeader !== undefined && (await validateAuthorizationHeader(authorizationHeader))

    if (hasValidCredentials) {
      return
    }

    return reply.status(401).send({
      error: "Unauthorized",
      message: "Invalid or missing credentials",
    })
  })
}
