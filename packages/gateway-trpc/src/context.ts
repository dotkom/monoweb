import { createServiceLayer } from "@dotkomonline/core"
import { kysely } from "@dotkomonline/db"
import type { inferAsyncReturnType } from "@trpc/server"
import type { CreateNextContextOptions } from "@trpc/server/adapters/next"
import { type Environment } from "@dotkomonline/env"
import { createVerifier } from "@dotkomonline/jwt-crypto"
import { type JwtService } from "@dotkomonline/jwt-crypto"

interface AuthContextProps {
  auth: {
    userId: string
  } | null
}

export const createContextInner = async (opts: AuthContextProps) => {
  const services = await createServiceLayer({ db: kysely })
  return {
    ...services,
    auth: opts.auth,
  }
}

export const createContext = async (opts: CreateNextContextOptions, jwtService: JwtService) => {
  const bearer = opts.req.headers.authorization
  if (bearer?.startsWith("Bearer ")) {
    try {
      const token = bearer.substring("Bearer ".length)
      const result = await jwtService.verify(token)
      console.log("forwarding request for", result.payload.sub)

      if (result.payload.sub === undefined) {
        throw new Error("decoded valid jwt without sub claim")
      }
      return createContextInner({
        auth: {
          userId: result.payload.sub,
        },
      })
    } catch (error) {
      console.error("Error verifying token", error)
      throw error
    }
  }
  return createContextInner({ auth: null })
}

export type Context = inferAsyncReturnType<typeof createContext>
