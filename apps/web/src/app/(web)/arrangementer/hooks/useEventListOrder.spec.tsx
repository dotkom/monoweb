// @vitest-environment jsdom

import type { EventWithAttendanceSummary } from "@dotkomonline/rpc/event"
import React, { act, type ComponentProps } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  createMockAttendanceSummary,
  createMockAttendee,
  createMockEvent,
} from "../../../../../.ladle/fixtures/attendance"
import { useEventListOrder } from "./useEventListOrder"

const registeredAttendee = createMockAttendee()

function createEventDetails(eventId: string, isRegistered = false): EventWithAttendanceSummary {
  let currentUserAttendee = null

  if (isRegistered) {
    currentUserAttendee = registeredAttendee
  }

  return {
    event: createMockEvent({ id: eventId, title: eventId }),
    attendance: createMockAttendanceSummary({ currentUserAttendee }),
  }
}

const firstEvent = createEventDetails("first-event")
const secondEvent = createEventDetails("second-event")
const yourEvent = createEventDetails("your-event", true)
let root: Root
let container: HTMLDivElement

function EventListProbe(options: Parameters<typeof useEventListOrder>[0]) {
  const { eventDetails, registeredEventCount, isLoading } = useEventListOrder(options)

  if (isLoading) {
    return <div>Loading</div>
  }

  return (
    <div data-registered-event-count={registeredEventCount}>
      {eventDetails.map(({ event, attendance }) => (
        <div key={event.id} data-event-id={event.id} data-registered={attendance?.currentUserAttendee !== null}>
          {event.title}
        </div>
      ))}
    </div>
  )
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

async function renderEvents(overrides: Partial<ComponentProps<typeof EventListProbe>> = {}) {
  await act(async () => {
    root.render(
      <EventListProbe
        futureEvents={[firstEvent, secondEvent]}
        registeredEvents={[yourEvent]}
        orderingKey="default"
        isInitialLoading={false}
        enabled={true}
        {...overrides}
      />
    )
  })
}

function eventIds() {
  return Array.from(container.querySelectorAll("[data-event-id]"), (element) => element.getAttribute("data-event-id"))
}

describe("event list order", () => {
  it("merges your events at the top and deduplicates events returned by both queries", async () => {
    await renderEvents({ futureEvents: [firstEvent, yourEvent, secondEvent] })

    expect(eventIds()).toEqual(["your-event", "first-event", "second-event"])
  })

  it("keeps a newly registered event in place as badges and query results update", async () => {
    await renderEvents()
    const newlyRegisteredEvent = createEventDetails("second-event", true)

    await renderEvents({
      futureEvents: [firstEvent, newlyRegisteredEvent],
      registeredEvents: [newlyRegisteredEvent, yourEvent],
    })

    expect(eventIds()).toEqual(["your-event", "first-event", "second-event"])
    expect(container.querySelector('[data-event-id="second-event"]')?.getAttribute("data-registered")).toBe("true")
    expect(container.querySelector("[data-registered-event-count]")?.getAttribute("data-registered-event-count")).toBe(
      "1"
    )

    await renderEvents({ registeredEvents: [yourEvent], futureEvents: [firstEvent, secondEvent] })

    expect(eventIds()).toEqual(["your-event", "first-event", "second-event"])
    expect(container.querySelector('[data-event-id="second-event"]')?.getAttribute("data-registered")).toBe("false")
  })

  it("puts newly registered events at the top after the list is remounted", async () => {
    await renderEvents()
    const newlyRegisteredEvent = createEventDetails("second-event", true)
    await renderEvents({
      futureEvents: [firstEvent, newlyRegisteredEvent],
      registeredEvents: [newlyRegisteredEvent, yourEvent],
    })

    await act(async () => root.unmount())
    root = createRoot(container)
    await renderEvents({
      futureEvents: [firstEvent, newlyRegisteredEvent],
      registeredEvents: [newlyRegisteredEvent, yourEvent],
    })

    expect(eventIds()).toEqual(["second-event", "your-event", "first-event"])
    expect(container.querySelector("[data-registered-event-count]")?.getAttribute("data-registered-event-count")).toBe(
      "2"
    )
  })

  it("remembers an event's position when separate query refetches briefly omit it", async () => {
    await renderEvents()
    const newlyRegisteredEvent = createEventDetails("first-event", true)
    await renderEvents({ futureEvents: [newlyRegisteredEvent, secondEvent] })
    await renderEvents({ futureEvents: [secondEvent] })
    await renderEvents({ futureEvents: [secondEvent], registeredEvents: [newlyRegisteredEvent, yourEvent] })

    expect(eventIds()).toEqual(["your-event", "first-event", "second-event"])
  })

  it("appends pagination results without moving existing events when the server reorders them", async () => {
    await renderEvents()
    await renderEvents({ futureEvents: [secondEvent, createEventDetails("third-event"), firstEvent] })

    expect(eventIds()).toEqual(["your-event", "first-event", "second-event", "third-event"])
  })

  it("waits for initial registered pages and preserves the order during later refetches", async () => {
    await renderEvents({ isInitialLoading: true, registeredEvents: [] })
    expect(container.textContent).toBe("Loading")

    await renderEvents()
    expect(eventIds()).toEqual(["your-event", "first-event", "second-event"])

    await renderEvents({ isInitialLoading: true })
    expect(eventIds()).toEqual(["your-event", "first-event", "second-event"])
  })

  it("resets ordering when filters or the user change", async () => {
    await renderEvents()
    await renderEvents({ orderingKey: "new-filter", futureEvents: [secondEvent], registeredEvents: [] })

    expect(eventIds()).toEqual(["second-event"])
  })

  it("waits until list view is active before capturing the initial order", async () => {
    await renderEvents({ enabled: false, registeredEvents: [] })
    await renderEvents({ isInitialLoading: true, registeredEvents: [] })
    expect(container.textContent).toBe("Loading")

    await renderEvents()
    expect(eventIds()).toEqual(["your-event", "first-event", "second-event"])
  })
})
