import {
  type FlattenedJWSInput,
  type GetKeyFunction,
  type JWTHeaderParameters,
  createRemoteJWKSet,
  jwtVerify,
} from "jose"

/**
 * A simple service for verifying JWTs issued by an OAuth2/OpenID Connect provider.
 *
 * Monoweb uses two IDPs at the moment: Auth0 and Feide.
 *
 * NOTE: As of August 2025, Feide has a non-standard JWKS endpoint.
 */
export class JwtService {
  private jwks: GetKeyFunction<JWTHeaderParameters, FlattenedJWSInput> | null = null
  private readonly jwksUrl: URL
  private readonly issuer: string
  private readonly audiences: string[]

  public constructor(issuer: string, audiences: string[], jwksUrl?: URL) {
    this.issuer = issuer
    this.audiences = audiences
    // It is clearer to compute the JWKS endpoint here without a trailing slash.
    const issuerWithoutTrailingSlash = issuer.replace(/\/$/, "")
    this.jwksUrl = jwksUrl ?? new URL(`${issuerWithoutTrailingSlash}/.well-known/jwks.json`)
  }

  public async verify(accessToken: string) {
    this.jwks ??= createRemoteJWKSet(this.jwksUrl)
    return jwtVerify(accessToken, this.jwks, {
      clockTolerance: "5s",
      algorithms: ["RS256"],
      issuer: this.issuer,
      audience: this.audiences,
      typ: "JWT",
    })
  }
}
