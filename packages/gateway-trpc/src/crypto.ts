import { createRemoteJWKSet, jwtVerify } from "jose"

export class JwtService {
  private jwks: ReturnType<typeof createRemoteJWKSet> | null = null
  private readonly jwksUrl: URL

  public constructor(
    private readonly issuer: string,
    private readonly audiences: string[]
  ) {
    const issuerWithoutTrailingSlash = issuer.replace(/\/$/, "")
    this.jwksUrl = new URL(`${issuerWithoutTrailingSlash}/.well-known/jwks.json`)
  }

  public async verify(accessToken: string) {
    this.jwks ??= createRemoteJWKSet(this.jwksUrl)
    return jwtVerify(accessToken, this.jwks, {
      clockTolerance: "5s",
      algorithms: ["RS256"],
      // Auth0's issuer contains a trailing slash, but Next Auth does not
      issuer: `${this.issuer}/`,
      // audience: this.audiences,
      typ: "JWT",
    })
  }
}
