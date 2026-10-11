// @vitest-environment jsdom

import { TRPCProvider, useTRPC } from "@/utils/trpc/client"
import type { AppRouter } from "@dotkomonline/rpc"
import { type BulkRegisterChangeEvent, buildBulkRegisterChangeEvent } from "@dotkomonline/rpc/attendance"
import type { EventWithAttendanceSummary } from "@dotkomonline/rpc/event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createTRPCClient } from "@trpc/client"
import { observable } from "@trpc/server/observable"
import React, { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  createMockAttendanceSummary,
  createMockAttendee,
  createMockEvent,
} from "../../../../../.ladle/fixtures/attendance"
import { useEventListSubscription } from "./useEventListSubscription"

let root: Root
let queryClient: QueryClient
let queryOptions: ReturnType<typeof useTRPC>
let sendUpdate: (update: BulkRegisterChangeEvent) => void
let startConnection: () => void
const requestInputs: unknown[] = []
const unsubscribe = vi.fn()

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    () =>
      ({ op: operation }) =>
        observable((observer) => {
          requestInputs.push(operation.input)
          expect(operation.path).toBe("event.attendance.onBulkRegisterChange")
          expect(operation.type).toBe("subscription")
          sendUpdate = (data) => observer.next({ result: { type: "data", data } })
          startConnection = () => observer.next({ result: { type: "started" } })

          return unsubscribe
        }),
  ],
})

const firstEvent = { event: createMockEvent(), attendance: createMockAttendanceSummary() }
const secondEvent = {
  event: createMockEvent({ id: "event-two", attendanceId: "attendance-two" }),
  attendance: { ...createMockAttendanceSummary(), id: "attendance-two" },
}

function SubscriptionProbe({ events, enabled }: { events: EventWithAttendanceSummary[]; enabled: boolean }) {
  queryOptions = useTRPC()
  useEventListSubscription({ events, enabled })

  return null
}

beforeEach(() => {
  requestInputs.length = 0
  unsubscribe.mockClear()
  vi.stubGlobal("React", React)
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
  root = createRoot(document.createElement("div"))
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
})

afterEach(async () => {
  await act(async () => root.unmount())
  queryClient.clear()
  vi.unstubAllGlobals()
})

async function renderSubscription(events = [firstEvent, secondEvent], enabled = true) {
  await act(async () => {
    root.render(
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <SubscriptionProbe events={events} enabled={enabled} />
        </QueryClientProvider>
      </TRPCProvider>
    )
  })
}

function seedLists() {
  const summariesKey = queryOptions.event.allSummaries.infiniteQueryKey()
  const registeredEventsKey = queryOptions.event.allSummariesByAttendingUserId.infiniteQueryKey({ id: "user-one" })
  const featuredEventsKey = queryOptions.event.findFeaturedEvents.infiniteQueryKey()
  const summaryPage = { items: [firstEvent, secondEvent], nextCursor: "cursor-one" }
  queryClient.setQueryData(summariesKey, { pages: [summaryPage, summaryPage], pageParams: [null, "cursor-one"] })
  queryClient.setQueryData(registeredEventsKey, { pages: [summaryPage], pageParams: [null] })
  queryClient.setQueryData(featuredEventsKey, { pages: [[firstEvent, secondEvent]], pageParams: [0] })

  return { summariesKey, registeredEventsKey, featuredEventsKey }
}

function createUpdate(currentUserId: string | null = null): BulkRegisterChangeEvent {
  return buildBulkRegisterChangeEvent(
    {
      attendee: createMockAttendee({ userId: "user-one" }),
      status: "reserved",
      poolOccupancies: [{ poolId: "pool-one", registeredCount: 4, capacity: 10, isPoolFull: false }],
    },
    currentUserId
  )
}

describe("event list subscription", () => {
  it("uses one stream for unique event IDs and keeps it stable when events are reordered", async () => {
    await renderSubscription([firstEvent, secondEvent, firstEvent])
    expect(requestInputs).toEqual([{ eventIds: [firstEvent.event.id, secondEvent.event.id].sort() }])

    await renderSubscription([secondEvent, { ...firstEvent }])
    expect(requestInputs).toHaveLength(1)

    await renderSubscription([firstEvent])
    expect(requestInputs).toHaveLength(2)
    expect(unsubscribe).toHaveBeenCalledOnce()
  })

  it("does not subscribe in calendar view or without events", async () => {
    await renderSubscription([], true)
    await renderSubscription([firstEvent], false)

    expect(requestInputs).toHaveLength(0)
  })

  it("patches absolute counts in every list cache without double-counting repeated updates", async () => {
    await renderSubscription()
    const { summariesKey, registeredEventsKey, featuredEventsKey } = seedLists()
    const update = createUpdate()

    await act(async () => {
      sendUpdate(update)
      sendUpdate(update)
    })

    const summaries = queryClient.getQueryData(summariesKey)
    expect(summaries?.pages.map((page) => page.items[0].attendance?.registeredAttendeeCount)).toEqual([4, 4])
    expect(summaries?.pages[0].items[1]).toEqual(secondEvent)
    expect(summaries?.pageParams).toEqual([null, "cursor-one"])
    expect(queryClient.getQueryData(registeredEventsKey)?.pages[0].items[0].attendance?.registeredAttendeeCount).toBe(4)
    expect(queryClient.getQueryData(featuredEventsKey)?.pages[0][0].attendance?.registeredAttendeeCount).toBe(4)
    expect(requestInputs).toHaveLength(1)
  })

  it("updates your full attendee record and clears it on deregistration", async () => {
    await renderSubscription()
    const { summariesKey, registeredEventsKey } = seedLists()
    const update = createUpdate("user-one")

    await act(async () => sendUpdate(update))

    expect(queryClient.getQueryData(summariesKey)?.pages[0].items[0].attendance?.currentUserAttendee).toEqual(
      update.attendee
    )
    expect(queryClient.getQueryState(registeredEventsKey)?.isInvalidated).toBe(false)

    await act(async () => sendUpdate({ ...update, status: "deregistered", registeredAttendeeCount: 3 }))

    expect(queryClient.getQueryData(summariesKey)?.pages[0].items[0].attendance?.currentUserAttendee).toBeNull()
    expect(queryClient.getQueryState(registeredEventsKey)?.isInvalidated).toBe(true)
  })

  it("refreshes summaries whenever the stream starts or reconnects", async () => {
    await renderSubscription()
    const { summariesKey, registeredEventsKey, featuredEventsKey } = seedLists()

    await act(async () => startConnection())

    for (const queryKey of [summariesKey, registeredEventsKey, featuredEventsKey]) {
      expect(queryClient.getQueryState(queryKey)?.isInvalidated).toBe(true)
    }

    await act(async () => sendUpdate(createUpdate()))
    expect(queryClient.getQueryState(summariesKey)?.isInvalidated).toBe(false)

    await act(async () => startConnection())
    expect(queryClient.getQueryState(summariesKey)?.isInvalidated).toBe(true)
  })
})
