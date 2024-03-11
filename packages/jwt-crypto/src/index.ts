import { createRemoteJWKSet, jwtVerify } from "jose"
import { z } from "zod"

export class JwtService {
  private jwks: ReturnType<typeof createRemoteJWKSet> | null = null
  private readonly jwksUrl: URL

  public constructor(private readonly issuer: string) {
    const issuerWithoutTrailingSlash = issuer.replace(/\/$/, "")
    this.jwksUrl = new URL(`${issuerWithoutTrailingSlash}/.well-known/jwks.json`)
  }

  /**
   * Verify a JWT token using the specified issuer's JWKS
   */
  public async verify(token: string) {
    this.jwks ??= createRemoteJWKSet(this.jwksUrl)
    return jwtVerify(token, this.jwks, {
      clockTolerance: "5s",
      algorithms: ["RS256"],
      issuer: this.issuer,
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

export const getRefreshToken = async ({
  issuer,
  refreshToken,
  clientId,
  clientSecret,
}: TryRefreshTokenOptions): Promise<string | null> => {
  const issuerWithoutTrailingSlash = issuer.replace(/\/$/, "")
  const endpoint = new URL(`${issuerWithoutTrailingSlash}/oauth/token`)
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
  // If the request was neither successful, nor a bad request (possibly due to
  // the refresh token being invalid), we'll throw an error.
  if (!response.ok && response.status !== 400) {
    console.error("Received non-200 response when trying to refresh token", response.statusText, await response.text())
    throw new OfflineRefreshRequestError(`Failed to refresh token, non-200 response from ${endpoint}`)
  }
  // Refresh token request failed, and we don't have a new token to use.
  if (response.status === 400) {
    console.warn("Failed to refresh token, received 400 response", await response.text())
    return null
  }
  // Validate the token endpoint response conforms to the expected shape
  // and return the newly acquired access token.
  const json = await response.json()
  const result = TokenEndpointResponse.safeParse(json)
  if (!result.success) {
    console.error("Failed to parse token endpoint response", result.error)
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

export const isJwtExpiredError = (error: unknown): boolean => {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "function" &&
    error.code() === "ERR_JWT_EXPIRED"
  )
}
