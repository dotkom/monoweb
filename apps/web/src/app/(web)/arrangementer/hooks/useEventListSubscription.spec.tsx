// @vitest-environment jsdom

import { TRPCProvider, useTRPC } from "@/utils/trpc/client"
import type { AppRouter } from "@dotkomonline/rpc"
import {
  type Attendance,
  type AttendanceView,
  type BulkRegisterChangeEvent,
  buildBulkRegisterChangeEvent,
  getAttendee,
  getAttendeeQueuePosition,
  getQueuedAttendeeCount,
  getRegisteredAttendeeCount,
} from "@dotkomonline/rpc/attendance"
import type { EventWithAttendanceSummary } from "@dotkomonline/rpc/event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createTRPCClient } from "@trpc/client"
import { observable } from "@trpc/server/observable"
import React, { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  createMockAttendanceSummary,
  createMockAttendance,
  createMockAttendee,
  createMockRegistrationAvailability,
  createMockEvent,
  createMockUser,
} from "../../../../../.ladle/fixtures/attendance"
import { useEventListSubscription } from "./useEventListSubscription"
import { attendanceCardQueryOptions } from "../components/AttendanceCard/attendanceCardQueryOptions"
import { useAttendanceCardApi } from "../components/AttendanceCard/use-attendance-card-api"

const mutations = vi.hoisted(() => ({ register: vi.fn(), deregister: vi.fn() }))

vi.mock("@/utils/trpc/QueryProvider", () => ({
  useTRPCSSERegisterChangeConnectionState: () => ({ setTRPCSSERegisterChangeConnectionState: vi.fn() }),
}))

vi.mock("../components/mutations", () => ({
  useRegisterMutation: mutations.register,
  useDeregisterMutation: mutations.deregister,
  useSetSelectionsOptionsMutation: () => ({ mutate: vi.fn() }),
}))

let root: Root
let queryClient: QueryClient
let queryOptions: ReturnType<typeof useTRPC>
let sendUpdate: (update: BulkRegisterChangeEvent) => void
let startConnection: () => void
const requestInputs: unknown[] = []
const requestPaths: string[] = []
const unsubscribe = vi.fn()
const fetchAttendance = vi.fn()
let serverAttendance: Attendance
let previewAttendanceData: AttendanceView | undefined

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    () =>
      ({ op: operation }) =>
        observable((observer) => {
          if (operation.type === "query") {
            expect(operation.path).toBe("event.attendance.getAttendance")
            fetchAttendance(operation.input)
            observer.next({ result: { data: serverAttendance } })
            observer.complete()
            return
          }
          requestInputs.push(operation.input)
          requestPaths.push(operation.path)
          expect(operation.type).toBe("subscription")
          if (operation.path === "event.attendance.onBulkRegisterChange") {
            sendUpdate = (data) => observer.next({ result: { type: "data", data } })
            startConnection = () => observer.next({ result: { type: "started" } })
          }

          return unsubscribe
        }),
  ],
})

const firstEvent = { event: createMockEvent(), attendance: createMockAttendanceSummary() }
const secondEvent = {
  event: createMockEvent({ id: "event-two", attendanceId: "attendance-two" }),
  attendance: { ...createMockAttendanceSummary(), id: "attendance-two" },
}

function AttendanceProbe({
  attendance,
  bulkSubscription,
}: {
  attendance: Attendance
  bulkSubscription?: { isConnected: boolean }
}) {
  const api = useAttendanceCardApi({
    initialAttendance: attendance,
    initialRegistrationAvailability: null,
    user: null,
    onDeregisterSuccess: () => {},
    bulkSubscription,
  })
  previewAttendanceData = api.attendance
  return null
}

function SubscriptionProbe({
  events,
  enabled,
  previewAttendance,
}: {
  events: EventWithAttendanceSummary[]
  enabled: boolean
  previewAttendance?: Attendance
}) {
  queryOptions = useTRPC()
  const subscription = useEventListSubscription({ events, enabled })

  return previewAttendance ? (
    <AttendanceProbe
      attendance={previewAttendance}
      bulkSubscription={subscription.attendanceIds.includes(previewAttendance.id) ? subscription : undefined}
    />
  ) : null
}

beforeEach(() => {
  requestInputs.length = 0
  requestPaths.length = 0
  mutations.register.mockReset().mockReturnValue({ mutate: vi.fn(), isPending: false })
  mutations.deregister.mockReset().mockReturnValue({ mutate: vi.fn(), isPending: false })
  unsubscribe.mockClear()
  fetchAttendance.mockClear()
  serverAttendance = createMockAttendance()
  previewAttendanceData = undefined
  vi.stubGlobal("React", React)
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
  root = createRoot(document.createElement("div"))
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Number.POSITIVE_INFINITY } } })
})

afterEach(async () => {
  await act(async () => root.unmount())
  queryClient.clear()
  vi.unstubAllGlobals()
})

async function renderSubscription(events = [firstEvent, secondEvent], enabled = true, previewAttendance?: Attendance) {
  await act(async () => {
    root.render(
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <SubscriptionProbe events={events} enabled={enabled} previewAttendance={previewAttendance} />
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
      status: "updated",
      poolOccupancies: [{ poolId: "pool-one", registeredCount: 4, capacity: 10, isPoolFull: false }],
    },
    currentUserId
  )
}

describe("event list subscription", () => {
  it("patches your payment update and refreshes availability without refetching event lists", async () => {
    await renderSubscription()

    const { summariesKey, registeredEventsKey, featuredEventsKey } = seedLists()
    const attendee = createMockAttendee({ userId: "user-one", completionDeadline: new Date() })

    const attendanceKey = attendanceCardQueryOptions(queryOptions, firstEvent.attendance.id).queryKey
    const availabilityKey = queryOptions.event.attendance.getRegistrationAvailability.queryKey({
      attendanceId: firstEvent.attendance.id,
    })

    const initialAttendance = createMockAttendance({ attendees: [attendee] })
    const initialAvailability = createMockRegistrationAvailability()

    queryClient.setQueryData(attendanceKey, initialAttendance)
    queryClient.setQueryData(availabilityKey, initialAvailability)

    const updatedAttendee = {
      ...attendee,
      paymentReservedAt: new Date(),
      completionDeadline: null,
    }

    const poolOccupancies = [{ poolId: attendee.attendancePoolId, registeredCount: 1, capacity: 10, isPoolFull: false }]

    const update = buildBulkRegisterChangeEvent(
      {
        status: "updated",
        attendee: updatedAttendee,
        poolOccupancies,
      },
      attendee.userId
    )

    await act(async () => {
      sendUpdate(update)
      sendUpdate(update)
    })

    const previewAttendance = queryClient.getQueryData(attendanceKey)
    const availabilityState = queryClient.getQueryState(availabilityKey)
    const eventSummaries = queryClient.getQueryData(summariesKey)
    const summaryAttendance = eventSummaries?.pages[0].items[0].attendance

    expect(previewAttendance?.attendees).toEqual([updatedAttendee])
    expect(availabilityState?.isInvalidated).toBe(true)
    expect(summaryAttendance?.currentUserAttendee).toEqual(updatedAttendee)
    expect(summaryAttendance?.registeredAttendeeCount).toBe(1)

    const eventListQueryKeys = [summariesKey, registeredEventsKey, featuredEventsKey]

    for (const queryKey of eventListQueryKeys) {
      const queryState = queryClient.getQueryState(queryKey)

      expect(queryState?.isInvalidated).toBe(false)
    }

    expect(fetchAttendance).not.toHaveBeenCalled()
  })

  it("keeps your full attendee and updates queue positions and counts from other attendees' summaries", async () => {
    await renderSubscription()
    const user = createMockUser({ id: "current-user" })
    const ownAttendee = createMockAttendee({
      id: "own-attendee",
      userId: user.id,
      user,
      registered: false,
      earliestReservationAt: new Date("2026-01-02"),
      completionDeadline: new Date("2026-02-01"),
      paymentLink: "https://example.com/payment",
    })
    const initialAttendance = createMockAttendance({ attendees: [ownAttendee] })
    const queryKey = attendanceCardQueryOptions(queryOptions, firstEvent.attendance.id).queryKey
    const fullQueryKey = queryOptions.event.attendance.getAttendanceForAdmin.queryKey({ id: firstEvent.attendance.id })
    queryClient.setQueryData(queryKey, initialAttendance)
    queryClient.setQueryData(fullQueryKey, initialAttendance)
    const otherAttendee = createMockAttendee({
      id: "other-attendee",
      registered: false,
      earliestReservationAt: new Date("2026-01-01"),
    })
    const update = buildBulkRegisterChangeEvent(
      {
        attendee: otherAttendee,
        status: "updated",
        poolOccupancies: [],
      },
      user.id
    )

    await act(async () => {
      sendUpdate(update)
      sendUpdate(update)
    })
    const attendance = queryClient.getQueryData(queryKey)
    expect(attendance?.attendees).toEqual([ownAttendee, update.attendee])
    expect(getAttendee(attendance ?? null, user)).toEqual(ownAttendee)
    expect(getAttendee(attendance ?? null, update.attendee.userId)).toBeNull()
    expect(attendance && getAttendeeQueuePosition(attendance, user)).toBe(2)
    expect(attendance && getQueuedAttendeeCount(attendance, ownAttendee.attendancePoolId)).toBe(2)
    expect(queryClient.getQueryData(fullQueryKey)).toEqual(initialAttendance)

    await act(async () =>
      sendUpdate(
        buildBulkRegisterChangeEvent(
          {
            attendee: { ...otherAttendee, registered: true },
            status: "registered",
            poolOccupancies: [],
          },
          user.id
        )
      )
    )
    const afterRegistration = queryClient.getQueryData(queryKey)
    expect(afterRegistration && getAttendeeQueuePosition(afterRegistration, user)).toBe(1)
    expect(afterRegistration && getRegisteredAttendeeCount(afterRegistration, ownAttendee.attendancePoolId)).toBe(1)

    await act(async () => sendUpdate({ ...update, status: "deregistered" }))
    expect(queryClient.getQueryData(queryKey)?.attendees).toEqual([ownAttendee])
  })

  it("patches another attendee in the preview without fetching or opening another stream", async () => {
    await renderSubscription([firstEvent], true, createMockAttendance())
    expect(fetchAttendance).not.toHaveBeenCalled()
    const update = createUpdate()
    await act(async () => {
      sendUpdate(update)
    })
    expect(fetchAttendance).not.toHaveBeenCalled()
    expect(previewAttendanceData?.attendees).toEqual([update.attendee])
    expect(requestPaths).toEqual(["event.attendance.onBulkRegisterChange"])

    await act(async () => {
      sendUpdate({ ...update, status: "deregistered" })
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
    expect(previewAttendanceData?.attendees).toEqual([])
  })

  it("shares the bulk stream with a covered preview and uses its connection state for mutations", async () => {
    await renderSubscription([firstEvent], true, createMockAttendance())
    expect(requestPaths).toEqual(["event.attendance.onBulkRegisterChange"])
    expect(mutations.register).toHaveBeenLastCalledWith(expect.objectContaining({ isSSEConnected: false }))

    await act(async () => startConnection())
    expect(mutations.register).toHaveBeenLastCalledWith(expect.objectContaining({ isSSEConnected: true }))
    expect(mutations.deregister).toHaveBeenLastCalledWith(expect.objectContaining({ isSSEConnected: true }))
    expect(requestPaths).toHaveLength(1)

    await renderSubscription([firstEvent], false, createMockAttendance())
    expect(requestPaths).toEqual(["event.attendance.onBulkRegisterChange", "event.attendance.onRegisterChange"])
    expect(mutations.register).toHaveBeenLastCalledWith(expect.objectContaining({ isSSEConnected: false }))
  })

  it("keeps a single stream for a preview outside the subscribed list", async () => {
    await renderSubscription([secondEvent], true, createMockAttendance())
    expect(requestPaths.sort()).toEqual(["event.attendance.onBulkRegisterChange", "event.attendance.onRegisterChange"])
  })

  it("keeps the single stream for a standalone attendance card", async () => {
    await act(async () => {
      root.render(
        <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <AttendanceProbe attendance={createMockAttendance()} />
          </QueryClientProvider>
        </TRPCProvider>
      )
    })
    expect(requestPaths).toEqual(["event.attendance.onRegisterChange"])
  })

  it("patches your preview attendee and refreshes availability on your own updates", async () => {
    await renderSubscription()
    const attendanceKey = attendanceCardQueryOptions(queryOptions, firstEvent.attendance.id).queryKey
    const availabilityKey = queryOptions.event.attendance.getRegistrationAvailability.queryKey({
      attendanceId: firstEvent.attendance.id,
    })
    const otherAttendanceKey = attendanceCardQueryOptions(queryOptions, secondEvent.attendance.id).queryKey
    queryClient.setQueryData(attendanceKey, createMockAttendance({ attendees: [] }))
    queryClient.setQueryData(availabilityKey, createMockRegistrationAvailability())
    queryClient.setQueryData(otherAttendanceKey, { ...createMockAttendance(), id: secondEvent.attendance.id })
    const update = createUpdate("user-one")

    await act(async () => sendUpdate(update))
    expect(queryClient.getQueryData(attendanceKey)?.attendees).toEqual([update.attendee])
    expect(queryClient.getQueryState(availabilityKey)?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(otherAttendanceKey)?.isInvalidated).toBe(false)

    await act(async () => sendUpdate({ ...update, status: "deregistered" }))
    expect(queryClient.getQueryData(attendanceKey)?.attendees).toEqual([])
  })

  it("patches other attendees and pool availability without invalidating the preview", async () => {
    await renderSubscription()
    const attendanceKey = attendanceCardQueryOptions(queryOptions, firstEvent.attendance.id).queryKey
    const availabilityKey = queryOptions.event.attendance.getRegistrationAvailability.queryKey({
      attendanceId: firstEvent.attendance.id,
    })
    const attendance = createMockAttendance({ attendees: [] })
    const availability = createMockRegistrationAvailability()
    queryClient.setQueryData(attendanceKey, attendance)
    queryClient.setQueryData(availabilityKey, availability)
    const update = createUpdate()
    const poolId = availability.pool?.id ?? ""
    update.poolOccupancies = [{ poolId, registeredCount: 10, capacity: 10, isPoolFull: true }]

    await act(async () => sendUpdate(update))
    expect(queryClient.getQueryState(attendanceKey)?.isInvalidated).toBe(false)
    expect(queryClient.getQueryData(attendanceKey)?.attendees).toEqual([update.attendee])
    expect(queryClient.getQueryState(availabilityKey)?.isInvalidated).toBe(false)
    expect(queryClient.getQueryData(availabilityKey)?.pool?.isPoolFull).toBe(true)
    expect(queryClient.getQueryData(availabilityKey)?.registration?.willBeQueued).toBe(true)
  })

  it("refreshes covered preview queries when the bulk stream reconnects", async () => {
    await renderSubscription([firstEvent])
    const attendanceKey = attendanceCardQueryOptions(queryOptions, firstEvent.attendance.id).queryKey
    const availabilityKey = queryOptions.event.attendance.getRegistrationAvailability.queryKey({
      attendanceId: firstEvent.attendance.id,
    })
    queryClient.setQueryData(attendanceKey, createMockAttendance())
    queryClient.setQueryData(availabilityKey, createMockRegistrationAvailability())

    await act(async () => startConnection())
    expect(queryClient.getQueryState(attendanceKey)?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(availabilityKey)?.isInvalidated).toBe(true)
  })

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
    expect(queryClient.getQueryState(registeredEventsKey)?.isInvalidated).toBe(false)
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
