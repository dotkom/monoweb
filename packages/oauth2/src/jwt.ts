import {
  type FlattenedJWSInput,
  type GetKeyFunction,
  type JWTHeaderParameters,
  createRemoteJWKSet,
  jwtVerify,
} from "jose"

/**
 * JWT Service for verifying JWTs from Auth0.
 */
export class JwtService {
  private jwks: GetKeyFunction<JWTHeaderParameters, FlattenedJWSInput> | null = null
  private readonly jwksUrl: URL
  private readonly issuer: string
  private readonly audiences: string[]

  public constructor(issuer: string, audiences: string[]) {
    this.issuer = issuer
    this.audiences = audiences
    const issuerWithoutTrailingSlash = issuer.replace(/\/$/, "")
    this.jwksUrl = new URL(`${issuerWithoutTrailingSlash}/.well-known/jwks.json`)
  }

  public async verify(accessToken: string) {
    this.jwks ??= createRemoteJWKSet(this.jwksUrl, {
      // Auth0 gives a max-age=15 and stale-while-revalidate=15 header. We will cache the JWKS for 30 seconds at a time.
    })
    return jwtVerify(accessToken, this.jwks, {
      clockTolerance: "5s",
      algorithms: ["RS256"],
      // Auth0's issuer contains a trailing slash, but Next Auth does not
      issuer: `${this.issuer}/`,
      audience: this.audiences,
      typ: "JWT",
    })
  }
}
