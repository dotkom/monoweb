export const HTTP_REQUEST_SOURCE_HEADER = "X-Request-Source" as const

export const HTTP_REQUEST_SOURCE_ATTRIBUTE = "http.request.source" as const

export const RpcRequestSource = {
  Web: "onlineweb-web",
  Admin: "onlineweb-admin",
  Vinstraff: "vinstraff",
  App: "online-app",
} as const

export type RpcRequestSourceValue = (typeof RpcRequestSource)[keyof typeof RpcRequestSource]

const UNKNOWN_REQUEST_SOURCE = "unknown" as const

export function getRpcRequestSourceHeaders<T extends RpcRequestSourceValue>(
  source: T
): Record<typeof HTTP_REQUEST_SOURCE_HEADER, T> {
  return {
    [HTTP_REQUEST_SOURCE_HEADER]: source,
  }
}

export function parseHttpRequestSource(header: string | string[] | undefined): string {
  if (typeof header === "string" && header !== "") {
    return header
  }

  if (Array.isArray(header)) {
    const firstValue = header[0]

    if (firstValue !== undefined && firstValue !== "") {
      return firstValue
    }
  }

  return UNKNOWN_REQUEST_SOURCE
}

export function readHttpRequestSourceFromHeaders(headers: Record<string, string | string[] | undefined>): string {
  return parseHttpRequestSource(headers[HTTP_REQUEST_SOURCE_HEADER.toLowerCase()])
}
