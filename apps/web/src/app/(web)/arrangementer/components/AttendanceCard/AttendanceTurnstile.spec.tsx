// @vitest-environment jsdom

import React, { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AttendanceTurnstile } from "./AttendanceTurnstile"

const mocks = vi.hoisted(() => ({ widget: vi.fn(), start: vi.fn(), disconnect: vi.fn() }))

vi.mock("react-turnstile", () => ({
  default: (props: unknown) => {
    mocks.widget(props)

    return <div>Cloudflare verification</div>
  },
}))

let container: HTMLDivElement
let root: Root
let onIntersection: IntersectionObserverCallback

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal("React", React)
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: IntersectionObserverCallback) {
        onIntersection = callback
      }

      observe() {}
      disconnect = mocks.disconnect
    }
  )

  container = document.createElement("div")
  container.setAttribute("data-slot", "drawer-content")
  document.body.append(container)
  root = createRoot(container)
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
  vi.unstubAllGlobals()
})

async function render(enabled = true) {
  await act(async () => {
    root.render(<AttendanceTurnstile enabled={enabled} defer onStart={mocks.start} sitekey="test-key" />)
  })
}

async function intersect(isIntersecting: boolean) {
  await act(async () => {
    onIntersection([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver)
  })
}

describe("attendance verification startup", () => {
  it("loads immediately by default for the full event page", async () => {
    container.removeAttribute("data-slot")

    await act(async () => {
      root.render(<AttendanceTurnstile enabled onStart={mocks.start} sitekey="test-key" />)
    })

    expect(mocks.widget).toHaveBeenCalled()
    expect(mocks.start).not.toHaveBeenCalled()
    expect(mocks.disconnect).not.toHaveBeenCalled()
  })

  it("does not mount Cloudflare until the widget is visible", async () => {
    await render()
    await intersect(false)

    expect(mocks.widget).not.toHaveBeenCalled()
    expect(mocks.start).not.toHaveBeenCalled()

    await intersect(true)

    expect(mocks.widget).toHaveBeenCalled()
    expect(mocks.start).toHaveBeenCalledOnce()
    expect(mocks.disconnect).toHaveBeenCalled()
  })

  it("waits for the drawer animation before starting verification", async () => {
    let finishAnimation: () => void = () => {}
    const finished = new Promise<Animation>((resolve) => {
      finishAnimation = () => resolve({} as Animation)
    })

    container.getAnimations = () => [{ finished } as Animation]

    await render()
    await intersect(true)

    expect(mocks.widget).not.toHaveBeenCalled()
    expect(mocks.start).not.toHaveBeenCalled()

    await act(async () => finishAnimation())

    expect(mocks.widget).toHaveBeenCalled()
    expect(mocks.start).toHaveBeenCalledOnce()
  })

  it("cancels pending verification when the drawer closes", async () => {
    let finishAnimation: () => void = () => {}
    const finished = new Promise<Animation>((resolve) => {
      finishAnimation = () => resolve({} as Animation)
    })

    container.getAnimations = () => [{ finished } as Animation]

    await render()
    await intersect(true)
    await render(false)
    await act(async () => finishAnimation())

    expect(mocks.widget).not.toHaveBeenCalled()
    expect(mocks.start).not.toHaveBeenCalled()
  })

  it("still starts verification when IntersectionObserver is unavailable", async () => {
    vi.stubGlobal("IntersectionObserver", undefined)

    await render()

    expect(mocks.widget).toHaveBeenCalled()
    expect(mocks.start).toHaveBeenCalledOnce()
  })
})
