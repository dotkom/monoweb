import { NextApiRequest, NextApiResponse } from "next"
import { getToken } from "next-auth/jwt"
import { createVerifier, tryRefreshToken } from "@dotkomonline/jwt-crypto"
import { env } from "@dotkomonline/env"

const verifierPromise = createVerifier(env.DASHBOARD_AUTH0_ISSUER)

const getBaseUrl = () => {
  // TODO: Replace with trpc gateway url
  if (env.NEXT_PUBLIC_NODE_ENV === "production") {
    return "https://web.online.ntnu.no"
  }
  return "http://localhost:3000"
}

const proxyPass = async (bearerToken: string | null, req: NextApiRequest, res: NextApiResponse) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...req.headersDistinct,
  }
  if (bearerToken !== null) {
    headers.Authorization = `Bearer ${bearerToken}`
  }
  console.log(`Proxying request to ${req.method} ${req.url}`, req.method, req.url)
  const response = await fetch(`${getBaseUrl()}/${req.url}`, {
    method: req.method,
    headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : JSON.stringify(req.body),
  })
  // TODO: Honor response headers
  return res.status(response.status).json(await response.json())
}

/**
 * Next.js pages API route acting as a BFF proxy for trpc.
 *
 * The purpose of this endpoint is to enable the client to make requests to the trpc server, without having to leak
 * access tokens to the client.
 */
export default async function proxy(req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req })
  if (token === null || token?.accessToken === undefined) {
    return await proxyPass(null, req, res)
  }
  const verifier = await verifierPromise
  try {
    const result = await verifier(token.accessToken)
    return await proxyPass(token.accessToken, req, res)
  } catch (error) {
    if (
      error !== null &&
      typeof error === "object" &&
      "code" in error &&
      typeof error.code === "function" &&
      error.code() === "ERR_JWT_EXPIRED" &&
      token.refreshToken !== undefined
    ) {
      const accessToken = await tryRefreshToken({
        issuer: env.DASHBOARD_AUTH0_ISSUER,
        refreshToken: token.refreshToken,
        clientId: env.DASHBOARD_AUTH0_CLIENT_ID,
        clientSecret: env.DASHBOARD_AUTH0_CLIENT_SECRET,
      })
      if (accessToken === null) {
        // If the refresh token is invalid,
        return res.status(401).json({ error: "Expired refresh token, please reauthenticate" })
      }
      return await proxyPass(accessToken, req, res)
    }
    console.error(error)
  }
}
