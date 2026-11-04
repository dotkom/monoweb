import { describe, expect, it } from "vitest"
import { readHttpRequestSourceFromHeaders } from "../rpc-request-source"

describe("readHttpRequestSourceFromHeaders", () => {
  it("reads the header when the key is lowercased", () => {
    expect(
      readHttpRequestSourceFromHeaders({
        "x-request-source": "onlineweb-web",
      })
    ).toBe("onlineweb-web")
  })

  it("returns unknown when the header is missing", () => {
    expect(readHttpRequestSourceFromHeaders({})).toBe("unknown")
  })
})
