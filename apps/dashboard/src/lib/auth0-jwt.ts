import {
  type FlattenedJWSInput,
  type GetKeyFunction,
  type JWTHeaderParameters,
  createRemoteJWKSet,
  jwtVerify,
} from "jose"

/**
 * JWT verification for Auth0 access tokens.
 */
export class Auth0JwtService {
  private jwks: GetKeyFunction<JWTHeaderParameters, FlattenedJWSInput> | null = null
  private readonly jwksUrl: URL
  private readonly issuer: string
  private readonly audiences: string[]

  public constructor(issuer: string, audiences: string[]) {
    const issuerWithoutTrailingSlash = issuer.replace(/\/$/, "")

    this.issuer = issuer
    this.audiences = audiences
    this.jwksUrl = new URL(`${issuerWithoutTrailingSlash}/.well-known/jwks.json`)
  }

  public async verify(accessToken: string) {
    this.jwks ??= createRemoteJWKSet(this.jwksUrl, {})

    return jwtVerify(accessToken, this.jwks, {
      clockTolerance: "5s",
      algorithms: ["RS256"],
      issuer: `${this.issuer}/`,
      audience: this.audiences,
      typ: "JWT",
    })
  }
}
