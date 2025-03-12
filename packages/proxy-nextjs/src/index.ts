import { getLogger } from "@dotkomonline/logger"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export interface ProxyOptions {
  mountPath: string
  apiEndpoint: string
}

export function createProxyRoute(opts: ProxyOptions): (request: NextRequest) => Promise<Response> {
  const logger = getLogger(`proxy-nextjs (${opts.mountPath})`)

  return async function route(request: NextRequest): Promise<Response> {
    const url = new URL(request.url)
    const pathFromRoot = url.pathname.replace(new RegExp(`^\/${opts.mountPath}`), "/")
    const endpoint = new URL(pathFromRoot, opts.apiEndpoint)
    for (const [key, value] of url.searchParams) {
      endpoint.searchParams.append(key, value)
    }

    const token = await getToken({ req: request })
    const headers = new Headers(request.headers)
    if (token !== null) {
      headers.set("Authorization", `Bearer ${token.accessToken}`)
    }

    const req = new Request(endpoint, {
      headers,
      method: request.method,
      body: request.method === "GET" ? undefined : request.body,
      // @ts-expect-error
      duplex: request.method !== "GET" ? "half" : undefined,
    })

    logger.info("proxying endpoint request: %s %s", req.method, req.url)
    const response = await fetch(req)
    const responseHeaders = new Headers()
    headers.set("Content-Type", response.headers.get("Content-Type") ?? "application/json")
    logger.info("proxying endpoint response: %s %s", response.status, response.statusText)
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  }
}
