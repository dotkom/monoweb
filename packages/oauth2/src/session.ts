import { createSecretKey } from "node:crypto"
import { SignJWT, jwtVerify } from "jose"
import { z } from "zod"
import { Auth0Profile, defaultSessionLengthSeconds } from "./authentication"

export type Session = z.infer<typeof Session>
export const Session = Auth0Profile.extend({
  accessToken: z.string(),
  refreshToken: z.string(),
})

export async function createSession(value: Session, secret: string): Promise<string> {
  return await new SignJWT(value)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Date.now() + defaultSessionLengthSeconds * 1000)
    .sign(createSecretKey(Uint8Array.from(secret)))
}

export async function getSession(jwt: string, secret: string): Promise<Session> {
  const { payload } = await jwtVerify(jwt, createSecretKey(Uint8Array.from(secret)))
  return Session.parse(payload)
}
