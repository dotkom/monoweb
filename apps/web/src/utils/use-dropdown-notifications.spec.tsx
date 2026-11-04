// @vitest-environment jsdom

import React, { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useDropdownNotifications } from "./use-dropdown-notifications"

type Notification = { id: string; readAt: Date | null }

let root: Root
let container: HTMLDivElement

const unreadNotification: Notification = { id: "unread-notification", readAt: null }
const readNotification: Notification = { id: "read-notification", readAt: new Date() }

function DropdownProbe({ userNotifications }: { userNotifications: Notification[] }) {
  const visibleNotifications = useDropdownNotifications(userNotifications)

  return <div>{visibleNotifications.map((notification) => notification.id).join(",")}</div>
}

async function renderDropdown(userNotifications: Notification[], isOpen = true) {
  await act(async () => {
    root.render(isOpen && <DropdownProbe userNotifications={userNotifications} />)
  })
}

beforeEach(() => {
  vi.stubGlobal("React", React)
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
  container = document.createElement("div")
  root = createRoot(container)
})

afterEach(async () => {
  await act(async () => root.unmount())
  vi.unstubAllGlobals()
})

describe("dropdown notifications", () => {
  it("hides notifications that were already read when opened", async () => {
    await renderDropdown([readNotification, unreadNotification])

    expect(container.textContent).toBe("unread-notification")
  })

  it("retains notifications marked as read while open and hides them after reopening", async () => {
    await renderDropdown([unreadNotification])
    const updatedNotifications = [{ ...unreadNotification, readAt: new Date() }]
    await renderDropdown(updatedNotifications)

    expect(container.textContent).toBe("unread-notification")

    await renderDropdown(updatedNotifications, false)
    await renderDropdown(updatedNotifications)

    expect(container.textContent).toBe("")
  })

  it("retains new unread notifications when they are read during the same opening", async () => {
    await renderDropdown([unreadNotification])
    const newNotification: Notification = { id: "new-notification", readAt: null }
    await renderDropdown([newNotification, unreadNotification])
    await renderDropdown([
      { ...newNotification, readAt: new Date() },
      { ...unreadNotification, readAt: new Date() },
    ])

    expect(container.textContent).toBe("new-notification,unread-notification")
  })

  it("hides already read notifications from subsequent pages", async () => {
    await renderDropdown([unreadNotification])
    await renderDropdown([unreadNotification, readNotification])

    expect(container.textContent).toBe("unread-notification")
  })

  it("handles notifications arriving after the dropdown opens while loading", async () => {
    await renderDropdown([])
    await renderDropdown([readNotification, unreadNotification])

    expect(container.textContent).toBe("unread-notification")
  })
})
