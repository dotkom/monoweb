// @vitest-environment jsdom

import { AuthorizationProvider } from "@admin/auth/authorization-context"
import { EventSelectInput, type EventSelectOption } from "@admin/components/forms/EventSelectInput"
import type { EventFilterQuery, EventWithAttendance } from "@dotkomonline/rpc/event"
import type { Group, GroupRoleType, GroupType } from "@dotkomonline/rpc/group"
import type { NotificationRecipientSelection } from "@dotkomonline/rpc/notification"
import React, { type PropsWithChildren } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createMockEvent } from "../../../../../../.ladle/fixtures/attendance"
import { RecipientSelectionBuilder } from "./RecipientSelection"

const queries = vi.hoisted(() => ({
  events: [] as EventWithAttendance[],
  selectedEvent: undefined as EventWithAttendance | undefined,
  eventSearch: vi.fn(),
}))

vi.mock("@admin/arrangementer/queries", () => ({
  useEventAllQuery: (input: { filter: EventFilterQuery }) => {
    queries.eventSearch(input)
    return { events: queries.events, isFetching: false }
  },
  useEventWithAttendancesGetQuery: () => ({ data: queries.selectedEvent, isLoading: false }),
}))

vi.mock("@admin/grupper/queries", () => ({ useGroupAllQuery: () => ({ groups: [] }) }))
vi.mock("@admin/brukere/components/UserSearch", () => ({ UserSearch: () => null }))
vi.mock("./EventAttendeeRecipientFilters", () => ({ EventAttendeeRecipientFilters: () => null }))
vi.mock("../queries", () => ({
  useRecipientSelectionPreview: () => ({ isPending: false, isForbidden: false }),
  useRecipientSelectionPreviewInfinite: () => ({ recipients: [], isPending: false, isForbidden: false }),
}))

vi.mock("@dotkomonline/ui", () => ({
  Button: ({ children }: PropsWithChildren) => <button type="button">{children}</button>,
  Text: ({ children }: PropsWithChildren) => <p>{children}</p>,
  TextInput: () => <input />,
  Card: ({ children }: PropsWithChildren) => <div>{children}</div>,
  Combobox: ({ items }: { items: EventSelectOption[] }) => (
    <select aria-label="Arrangement">
      {items.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  ),
  ComboboxContent: () => null,
  ComboboxEmpty: () => null,
  ComboboxInput: () => null,
  ComboboxItem: () => null,
  ComboboxList: () => null,
}))

function createGroup(slug: string, type: GroupType = "COMMITTEE"): Group {
  return {
    slug,
    type,
    abbreviation: slug,
    name: null,
    preferredDisplayName: "ABBREVIATION",
    shortDescription: null,
    description: "",
    imageUrl: null,
    email: null,
    contactUrl: null,
    slackUrl: null,
    showLeaderAsContact: false,
    createdAt: new Date(),
    deactivatedAt: null,
    workspaceGroupId: null,
    memberVisibility: "ALL_MEMBERS",
    recruitmentMethod: "NONE",
    roles: [],
  }
}

const groups = [
  createGroup("arrkom"),
  createGroup("bedkom"),
  createGroup("backlog"),
  createGroup("chess", "INTEREST_GROUP"),
]

function renderRecipientSelection(groupSlug: string, value: NotificationRecipientSelection | null = null) {
  const affiliations: Record<string, GroupRoleType[]> = { [groupSlug]: ["COSMETIC"] }

  return renderToStaticMarkup(
    <AuthorizationProvider
      subject="user-1"
      affiliations={affiliations}
      groups={Object.fromEntries(groups.map((group) => [group.slug, group.type]))}
    >
      <RecipientSelectionBuilder value={value} onChange={() => {}} type="BROADCAST" />
    </AuthorizationProvider>
  )
}

const eventSelection: NotificationRecipientSelection = {
  rules: [
    {
      type: "EVENT_ATTENDEES",
      attendanceId: "attendance-1",
      reservationStatus: "RESERVED",
      paymentStatus: "ALL",
    },
  ],
  excludedUserIds: [],
}

beforeEach(() => {
  vi.stubGlobal("React", React)
  queries.eventSearch.mockClear()
  queries.selectedEvent = undefined
  queries.events = groups.map((group) => ({
    event: createMockEvent({ id: group.slug, title: `${group.slug} event`, hostingGroups: [group] }),
    attendance: null,
  }))
})

afterEach(() => vi.unstubAllGlobals())

describe("recipient selection authorization", () => {
  it("hides individual and all-user targeting from ordinary committee members", () => {
    const markup = renderRecipientSelection("arrkom")

    expect(markup).not.toContain("Enkeltpersoner")
    expect(markup).not.toContain("Alle brukere")
    expect(markup).toContain("Påmeldte på arrangement")
    expect(markup).toContain("Medlemmer av gruppe")
  })

  it.each(["dotkom", "hs"])("keeps individual and all-user targeting for %s administrators", (groupSlug) => {
    const markup = renderRecipientSelection(groupSlug)

    expect(markup).toContain("Enkeltpersoner")
    expect(markup).toContain("Alle brukere")
  })

  it("only offers events organized by the caller's committee", () => {
    const markup = renderRecipientSelection("arrkom", eventSelection)

    expect(markup).toContain("arrkom event")
    expect(markup).not.toContain("bedkom event")
    expect(markup).not.toContain("chess event")
    expect(queries.eventSearch).toHaveBeenCalledWith(
      expect.objectContaining({ filter: expect.objectContaining({ byOrganizingGroup: ["arrkom"] }) })
    )
  })

  it("preserves Backlog's access to interest-group events", () => {
    const markup = renderRecipientSelection("backlog", eventSelection)

    expect(markup).toContain("backlog event")
    expect(markup).toContain("chess event")
    expect(markup).not.toContain("arrkom event")
    expect(queries.eventSearch).toHaveBeenCalledWith(
      expect.objectContaining({ filter: expect.objectContaining({ byOrganizingGroup: ["backlog", "chess"] }) })
    )
  })

  it("applies the server's interest-group rule to events with multiple organizers", () => {
    queries.events.push({
      event: createMockEvent({ id: "shared", title: "Shared event", hostingGroups: [groups[0], groups[3]] }),
      attendance: null,
    })

    const markup = renderRecipientSelection("arrkom", eventSelection)

    expect(markup).toContain("arrkom event")
    expect(markup).not.toContain("Shared event")
  })

  it("keeps all events available to administrators", () => {
    const markup = renderRecipientSelection("dotkom", eventSelection)

    expect(markup).toContain("arrkom event")
    expect(markup).toContain("bedkom event")
    expect(markup).toContain("chess event")
    expect(queries.eventSearch.mock.lastCall?.[0].filter.byOrganizingGroup).toBeUndefined()
  })

  it("does not restore a previously selected unauthorized event to the options", () => {
    queries.selectedEvent = queries.events.find(({ event }) => event.id === "bedkom")
    queries.events = queries.events.filter(({ event }) => event.id === "arrkom")

    const markup = renderToStaticMarkup(
      <EventSelectInput value="bedkom" onChange={() => {}} isEventSelectable={(event) => event.id === "arrkom"} />
    )

    expect(markup).toContain("arrkom event")
    expect(markup).not.toContain("bedkom event")
  })

  it("preserves selected events outside the search results for unrestricted selectors", () => {
    queries.selectedEvent = queries.events.find(({ event }) => event.id === "bedkom")
    queries.events = []

    const markup = renderToStaticMarkup(<EventSelectInput value="bedkom" onChange={() => {}} />)

    expect(markup).toContain("bedkom event")
  })
})
