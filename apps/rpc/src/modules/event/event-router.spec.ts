import type { DBHandle } from "@dotkomonline/db"
import type { TRPCContext } from "../../trpc"
import type { Event } from "./event"
import { eventRouter } from "./event-router"

const transactionHandle = {} as DBHandle

function createRouterContext(principal: TRPCContext["principal"], eventService: object): TRPCContext {
  return {
    principal,
    prisma: {
      $transaction: vi.fn(
        async (callback: (handle: DBHandle) => Promise<unknown>) => await callback(transactionHandle)
      ),
    },
    eventService,
    attendanceService: {
      getAttendanceSummariesByIds: vi.fn().mockResolvedValue([]),
      findAttendanceById: vi.fn(),
    },
    authorizationService: {
      isCommitteeMember: vi.fn().mockReturnValue(false),
    },
    addAuthorizationGuard: vi.fn(),
  } as unknown as TRPCContext
}

const authenticatedEvent: Event = {
  id: "authenticated-event",
  title: "Authenticated event",
  start: new Date("2026-10-01T10:00:00Z"),
  end: new Date("2026-10-01T12:00:00Z"),
  status: "PUBLIC",
  description: "Only visible to authenticated users",
  shortDescription: null,
  imageUrl: null,
  locationTitle: null,
  locationAddress: null,
  locationLink: null,
  type: "SOCIAL",
  visibility: "AUTHENTICATED",
  markForMissedAttendance: true,
  createdAt: new Date("2026-09-24T12:00:00Z"),
  updatedAt: new Date("2026-09-24T12:00:00Z"),
  attendanceId: null,
  parentId: null,
  contestId: null,
  metadataImportId: null,
  companies: [],
  hostingGroups: [],
}

describe("authenticated event visibility", () => {
  it("excludes authenticated and committee-only events from anonymous summaries", async () => {
    const findEventSummaries = vi.fn().mockResolvedValue([])
    const context = createRouterContext(null, { findEventSummaries })
    const caller = eventRouter.createCaller(context)

    await caller.allSummaries({
      filter: {
        orderBy: "asc",
      },
    })

    expect(findEventSummaries).toHaveBeenCalledWith(
      transactionHandle,
      expect.objectContaining({ excludingVisibility: ["AUTHENTICATED", "COMMITTEE_ONLY"] }),
      { take: 20 }
    )
  })

  it("includes authenticated events in summaries when a principal exists", async () => {
    const findEventSummaries = vi.fn().mockResolvedValue([])
    const context = createRouterContext(
      {
        subject: "user-1",
        affiliations: new Map(),
        scopes: new Set(),
      },
      { findEventSummaries }
    )
    const caller = eventRouter.createCaller(context)

    await caller.allSummaries({
      filter: {
        orderBy: "asc",
      },
    })

    expect(findEventSummaries).toHaveBeenCalledWith(
      transactionHandle,
      expect.objectContaining({ excludingVisibility: ["COMMITTEE_ONLY"] }),
      { take: 20 }
    )
  })

  it("hides direct authenticated event lookups from anonymous users", async () => {
    const findEventById = vi.fn().mockResolvedValue(authenticatedEvent)
    const context = createRouterContext(null, { findEventById })
    const caller = eventRouter.createCaller(context)

    await expect(caller.find(authenticatedEvent.id)).resolves.toBeNull()
  })

  it("allows direct authenticated event lookups when a principal exists", async () => {
    const findEventById = vi.fn().mockResolvedValue(authenticatedEvent)
    const context = createRouterContext(
      {
        subject: "user-1",
        affiliations: new Map(),
        scopes: new Set(),
      },
      { findEventById }
    )
    const caller = eventRouter.createCaller(context)

    await expect(caller.find(authenticatedEvent.id)).resolves.toEqual({ event: authenticatedEvent, attendance: null })
  })
})
