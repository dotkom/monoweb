import { createRemoteJWKSet, jwtVerify } from "jose"
import { getLogger } from "@dotkomonline/logger"
import { z } from "zod"

const logger = getLogger("jwt-crypto")

/**
 * Verify a JWT using a remote JSON Web Key Set.
 *
 * TODO: Consider whether we want to verify the audience.
 */
export const createVerifier = async (issuer: string) => {
  const issuerWithoutTrailingSlash = issuer.replace(/\/$/, "")
  const jwks = await createRemoteJWKSet(new URL(`${issuerWithoutTrailingSlash}/.well-known/jwks.json`))

  return (token: string) => {
    return jwtVerify(token, jwks, {
      clockTolerance: "5s",
      algorithms: ["RS256"],
      issuer,
    })
  }
}

export interface TryRefreshTokenOptions {
  issuer: string
  refreshToken: string
  clientId: string
  clientSecret: string
}

export class OfflineRefreshRequestError extends Error {}

export const tryRefreshToken = async ({
  issuer,
  refreshToken,
  clientId,
  clientSecret,
}: TryRefreshTokenOptions): Promise<string | null> => {
  const endpoint = `${issuer}/oauth/token`
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })
  if (!response.ok && response.status !== 400) {
    logger.error("Received non-200 response when trying to refresh token", response.statusText, await response.text())
    throw new OfflineRefreshRequestError(`Failed to refresh token, non-200 response from ${endpoint}`)
  }

  if (response.status === 400) {
    logger.warn("Failed to refresh token, received 400 response", await response.text())
    return null
  }

  const json = await response.json()
  const result = TokenEndpointResponse.safeParse(json)
  if (!result.success) {
    logger.error("Failed to parse token endpoint response", result.error)
    throw new OfflineRefreshRequestError(
      `Token endpoint did not conform to the token endpoint shape, ${result.error.message}`
    )
  }
  return result.data.access_token
}

const TokenEndpointResponse = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
})
