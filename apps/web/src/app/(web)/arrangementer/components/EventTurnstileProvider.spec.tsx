// @vitest-environment jsdom

import React, { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import type { BoundTurnstileObject, TurnstileProps } from "react-turnstile"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { EventTurnstileProvider, useEventTurnstile } from "./EventTurnstileProvider"

const mocks = vi.hoisted(() => ({ auth: vi.fn(), widget: vi.fn() }))

vi.mock("@/env", () => ({ env: { NEXT_PUBLIC_TURNSTILE_SITE_KEY: "test-key" } }))
vi.mock("@/utils/use-authenticated-user", () => ({ useAuthenticatedUser: mocks.auth }))
vi.mock("react-turnstile", () => ({
  default: (props: TurnstileProps) => {
    const [bound] = React.useState(() => ({
      execute: vi.fn(),
      reset: vi.fn(),
      getResponse: vi.fn(),
      isExpired: vi.fn(() => false),
    }))

    React.useEffect(() => props.onLoad?.("test-widget", bound), [props.onLoad, bound])
    mocks.widget(props, bound)

    return <div data-widget />
  },
}))

let root: Root
let container: HTMLDivElement
let verification: ReturnType<typeof useEventTurnstile>
let idleCallback: IdleRequestCallback | null

function Preview() {
  verification = useEventTurnstile()

  return <div>{verification?.token ?? "Regular verification"}</div>
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal("React", React)
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
  idleCallback = null
  vi.stubGlobal("requestIdleCallback", (callback: IdleRequestCallback) => {
    idleCallback = callback

    return 1
  })
  vi.stubGlobal("cancelIdleCallback", vi.fn())
  vi.stubGlobal("matchMedia", () => ({ matches: true }))
  vi.spyOn(document, "readyState", "get").mockReturnValue("complete")
  mocks.auth.mockReturnValue({ dbUser: { id: "user-one" } })

  container = document.createElement("div")
  document.body.append(container)
  root = createRoot(container)
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

async function render(backgroundEnabled = true, runIdle = true) {
  await act(async () => {
    root.render(
      <EventTurnstileProvider backgroundEnabled={backgroundEnabled}>
        <Preview />
      </EventTurnstileProvider>
    )
  })

  if (runIdle && idleCallback !== null) {
    const callback = idleCallback
    idleCallback = null

    await act(async () => callback({} as IdleDeadline))
  }
}

function bound(): BoundTurnstileObject {
  return mocks.widget.mock.lastCall?.[1]
}

function widget(): TurnstileProps {
  return mocks.widget.mock.lastCall?.[0]
}

async function verify(token = "background-token") {
  await act(async () => widget().onVerify?.(token, bound()))
}

describe("background event verification", () => {
  it("does not start verification in the initial render", async () => {
    await render(true, false)

    expect(mocks.widget).not.toHaveBeenCalled()

    await render()

    expect(mocks.widget).toHaveBeenCalled()
  })

  it("waits for page resources to load before requesting idle time", async () => {
    vi.spyOn(document, "readyState", "get").mockReturnValue("loading")

    await render()

    expect(idleCallback).toBeNull()
    expect(mocks.widget).not.toHaveBeenCalled()

    await act(async () => window.dispatchEvent(new Event("load")))
    await render()

    expect(mocks.widget).toHaveBeenCalled()
  })

  it("cancels scheduled startup when a preview opens before the browser is idle", async () => {
    await render(true, false)
    await render(false, false)

    expect(window.cancelIdleCallback).toHaveBeenCalledWith(1)
    expect(mocks.widget).not.toHaveBeenCalled()
  })

  it("does not run background verification on mobile", async () => {
    vi.stubGlobal("matchMedia", () => ({ matches: false }))

    await render()

    expect(idleCallback).toBeNull()
    expect(mocks.widget).not.toHaveBeenCalled()
  })

  it("shares the token while keeping its widget mounted for expiry notifications", async () => {
    await render()

    expect(mocks.widget).toHaveBeenCalled()
    expect(container.textContent).toBe("Regular verification")

    await verify()

    expect(widget().appearance).toBe("interaction-only")
    expect(container.textContent).toBe("background-token")
  })

  it("consumes a token once and resets the existing widget for the next token", async () => {
    await render()
    await verify()

    const previousWidget = container.querySelector("[data-widget]")
    let firstToken: string | null = null
    let secondToken: string | null = null

    await act(async () => {
      firstToken = verification?.takeToken() ?? null
      secondToken = verification?.takeToken() ?? null
    })

    expect(firstToken).toBe("background-token")
    expect(secondToken).toBeNull()
    expect(container.textContent).toBe("Regular verification")
    expect(container.querySelector("[data-widget]")).toBe(previousWidget)
    expect(bound().reset).toHaveBeenCalledOnce()
  })

  it("clears the token when Cloudflare reports expiry", async () => {
    await render()
    await verify()

    await act(async () => widget().onExpire?.("background-token", bound()))

    expect(verification?.token).toBeNull()
    expect(container.textContent).toBe("Regular verification")
  })

  it("falls back to regular verification when background interaction is required", async () => {
    await render()

    await act(async () => widget().onBeforeInteractive?.(bound()))

    expect(container.querySelector("[data-widget]")).toBeNull()
    expect(container.textContent).toBe("Regular verification")
  })

  it("rejects an expired token even before Cloudflare's expiry callback arrives", async () => {
    await render()
    await verify()

    vi.mocked(bound().isExpired).mockReturnValue(true)

    let token: string | null = null

    await act(async () => {
      token = verification?.takeToken() ?? null
    })

    expect(token).toBeNull()
    expect(verification?.token).toBeNull()
  })

  it("does not let an unmounted widget overwrite a newer token", async () => {
    await render()
    await verify()

    const oldWidget = widget()
    const oldBound = bound()

    await render(false)
    await act(async () => verification?.takeToken())
    await render()
    await verify("new-token")
    await act(async () => oldWidget.onVerify?.("old-token", oldBound))
    await act(async () => oldWidget.onExpire?.("old-token", oldBound))

    expect(verification?.token).toBe("new-token")
  })

  it("clears the token when the signed-in account changes", async () => {
    await render()
    await verify()

    mocks.auth.mockReturnValue({ dbUser: { id: "user-two" } })

    await render()

    expect(verification?.token).toBeNull()

    await verify("user-two-token")

    expect(verification?.token).toBe("user-two-token")
  })

  it("does not start background verification for logged-out visitors", async () => {
    mocks.auth.mockReturnValue({ dbUser: null })

    await render()

    expect(mocks.widget).not.toHaveBeenCalled()
    expect(verification?.token).toBeNull()
  })

  it("keeps a prepared token while background verification is paused for the preview", async () => {
    await render()
    await verify()
    await render(false)

    expect(verification?.token).toBe("background-token")
    expect(container.querySelector("[data-widget]")).not.toBeNull()

    await act(async () => verification?.takeToken())

    expect(container.querySelector("[data-widget]")).toBeNull()
    expect(verification?.token).toBeNull()

    await render()

    expect(container.querySelector("[data-widget]")).not.toBeNull()
  })
})
