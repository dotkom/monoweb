// @vitest-environment jsdom

import React, { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useMarkNotificationAsReadWhenVisible } from "./use-mark-notification-as-read-when-visible"

let root: Root
const observers: { callback: IntersectionObserverCallback; disconnect: ReturnType<typeof vi.fn> }[] = []
const markAsRead = vi.fn()

function NotificationProbe({
  notificationId = "notification-one",
  readAt = null,
}: {
  notificationId?: string
  readAt?: Date | null
}) {
  const elementReference = useMarkNotificationAsReadWhenVisible<HTMLDivElement>({
    notificationId,
    readAt,
    onMarkAsRead: markAsRead,
  })

  return <div ref={elementReference} />
}

beforeEach(() => {
  observers.length = 0
  markAsRead.mockReset()
  vi.stubGlobal("React", React)
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
  vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible")
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      disconnect = vi.fn()
      observe = vi.fn()

      constructor(callback: IntersectionObserverCallback) {
        observers.push({ callback, disconnect: this.disconnect })
      }
    }
  )
  root = createRoot(document.createElement("div"))
})

afterEach(async () => {
  await act(async () => root.unmount())
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function intersect(intersectionRatio: number) {
  observers
    .at(-1)
    ?.callback(
      [{ isIntersecting: intersectionRatio > 0, intersectionRatio } as IntersectionObserverEntry],
      {} as IntersectionObserver
    )
}

describe("notification visibility", () => {
  it("marks a notification once when at least half is visible", async () => {
    await act(async () => root.render(<NotificationProbe />))

    intersect(0)
    intersect(0.25)
    expect(markAsRead).not.toHaveBeenCalled()

    intersect(0.5)
    intersect(1)
    expect(markAsRead).toHaveBeenCalledTimes(1)
    expect(observers[0].disconnect).toHaveBeenCalled()
  })

  it("does not mark an already read notification", async () => {
    await act(async () => root.render(<NotificationProbe readAt={new Date()} />))

    expect(observers).toHaveLength(0)
  })

  it("waits for the browser tab to become visible", async () => {
    const visibilityState = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden")
    await act(async () => root.render(<NotificationProbe />))

    intersect(1)
    expect(markAsRead).not.toHaveBeenCalled()

    visibilityState.mockReturnValue("visible")
    document.dispatchEvent(new Event("visibilitychange"))
    expect(markAsRead).toHaveBeenCalledTimes(1)
  })

  it("observes the next selected notification and disconnects on unmount", async () => {
    await act(async () => root.render(<NotificationProbe />))
    intersect(1)
    await act(async () => root.render(<NotificationProbe notificationId="notification-two" />))
    intersect(1)

    expect(markAsRead).toHaveBeenCalledTimes(2)
    expect(observers[0].disconnect).toHaveBeenCalled()
  })
})
