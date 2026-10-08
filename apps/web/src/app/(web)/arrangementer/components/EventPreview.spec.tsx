// @vitest-environment jsdom

import React, { act, type ComponentProps } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { EventPreviewLink } from "@/components/molecules/EventListItem/EventPreviewLink"
import { EventPreview } from "./EventPreview"

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  attendance: vi.fn(),
  refetch: vi.fn(),
  time: vi.fn(),
  copy: vi.fn(),
}))

vi.mock("next/link", () => ({ default: (props: ComponentProps<"a">) => <a {...props} /> }))

vi.mock("@/env", () => ({ env: { NEXT_PUBLIC_ORIGIN: "https://online.test" } }))

vi.mock("@/utils/use-copy-to-clipboard", () => ({ useCopyToClipboard: () => ({ icon: "copy", copy: mocks.copy }) }))

vi.mock("@/utils/use-authenticated-user", () => ({ useAuthenticatedUser: () => ({ dbUser: null }) }))

vi.mock("@/utils/trpc/client", () => ({
  useTRPC: () => ({
    event: {
      find: { queryOptions: (id: string) => ({ queryKey: ["event", id] }) },
      findParentEvent: { queryOptions: () => ({ queryKey: ["parent"] }) },
      isOrganizer: { queryOptions: () => ({ queryKey: ["organizer"] }) },
    },
    user: { isAdmin: { queryOptions: () => ({ queryKey: ["admin"] }) } },
  }),
}))

vi.mock("@tanstack/react-query", () => ({ useQuery: mocks.query }))

vi.mock("@dotkomonline/ui", async () => {
  const drawer = await import("@dotkomonline/ui/components/drawer")
  const { cn } = await import("@dotkomonline/ui/lib/utils")

  return {
    ...drawer,
    cn,
    ReadMore: ({ children }: React.PropsWithChildren) => <>{children}</>,
    Button: ({
      element: Element = "button",
      variant: _variant,
      size: _size,
      ...props
    }: ComponentProps<"button"> & {
      element?: React.ElementType
      variant?: string
      size?: string
    }) => <Element {...props} />,
    Text: (props: ComponentProps<"p">) => <p {...props} />,
    Title: ({
      element: Element = "h2",
      size: _size,
      ...props
    }: ComponentProps<"h2"> & {
      element?: React.ElementType
      size?: string
    }) => <Element {...props} />,
  }
})

vi.mock("@/components/molecules/EventListItem/EventListItem", () => ({ EventListItem: () => <div>Parent</div> }))

vi.mock("./EventHeader", () => ({
  EventHeader: () => <div data-section="header">Header</div>,
  SkeletonEventHeader: () => <div>Loading</div>,
}))

vi.mock("./TimeLocationBox/TimeBox", () => ({
  TimeBox: (props: unknown) => {
    mocks.time(props)

    return <div data-section="time">Time</div>
  },
}))

vi.mock("./TimeLocationBox/LocationBox", () => ({ LocationBox: () => <div data-section="location">Location</div> }))

vi.mock("./OrganizerPill", () => ({ OrganizerPill: () => <div data-section="organizer">Organizer</div> }))

vi.mock("./EventDescription", () => ({ EventDescription: () => <div data-section="description">Description</div> }))

vi.mock("./AttendanceCard/AttendanceCard", () => ({
  AttendanceCard: (props: unknown) => {
    mocks.attendance(props)

    return <div data-section="attendance">Attendance</div>
  },
}))

const event = {
  id: "event-one",
  title: "Testevent",
  description: "Details",
  hostingGroups: [{ slug: "dotkom" }],
  companies: [],
}

let eventQuery: {
  data: { event: typeof event; attendance: { id: string } | null } | null
  isLoading: boolean
  isError: boolean
}
let container: HTMLDivElement
let root: Root
let desktop: MediaQueryList
let resize: (() => void) | undefined

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal("React", React)
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  )
  vi.spyOn(window, "scrollTo").mockImplementation(() => {})
  desktop = {
    matches: true,
    addEventListener: vi.fn((_type, listener) => {
      resize = listener
    }),
    removeEventListener: vi.fn(),
  } as unknown as MediaQueryList
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => desktop)
  )
  resize = undefined
  eventQuery = { data: { event, attendance: { id: "attendance-one" } }, isLoading: false, isError: false }
  mocks.query.mockImplementation(({ queryKey }: { queryKey: string[] }) =>
    queryKey[0] === "event" ? { ...eventQuery, refetch: mocks.refetch } : { data: null }
  )
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

async function renderPreview() {
  await act(async () => {
    root.render(
      <EventPreview>
        <EventPreviewLink event={event} href="/arrangementer/testevent/event-one">
          Testevent
        </EventPreviewLink>
      </EventPreview>
    )
  })

  return container.querySelector("a") as HTMLAnchorElement
}

describe("desktop event preview", () => {
  it("opens a side drawer with ordered details and a dimmed backdrop without blur", async () => {
    const link = await renderPreview()
    expect(mocks.query).not.toHaveBeenCalled()
    link.focus()
    await act(async () => link.click())

    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()
    expect(dialog?.getAttribute("data-vaul-drawer-direction")).toBe("right")
    expect(dialog?.className).toContain("data-[vaul-drawer-direction=right]:w-[min(--spacing(152),60vw)]")
    expect(dialog?.className).toContain("data-[vaul-drawer-direction=right]:inset-y-4")
    expect(dialog?.className).toContain("data-[vaul-drawer-direction=right]:right-4")
    expect(dialog?.className).not.toContain("data-[vaul-drawer-direction=right]:inset-y-0")
    expect(
      Array.from(dialog?.querySelectorAll("[data-section]") ?? [], (section) => section.getAttribute("data-section"))
    ).toEqual(["header", "time", "location", "organizer", "description", "attendance"])
    expect(mocks.attendance).toHaveBeenCalledWith(
      expect.objectContaining({ initialAttendance: { id: "attendance-one" } })
    )
    const overlay = document.querySelector('[data-slot="drawer-overlay"]')
    expect(overlay?.className).toContain("bg-black/20")
    expect(overlay?.className).toContain("dark:bg-black/50")
    expect(overlay?.className).toContain("supports-backdrop-filter:backdrop-blur-none")
    expect(overlay?.className).not.toContain("backdrop-blur-xs")
    expect(dialog?.querySelector('a[href="/arrangementer/testevent/event-one"]')).not.toBeNull()
  })

  it("omits attendance when there is none and offers adding the event to a calendar", async () => {
    eventQuery.data = { event, attendance: null }
    const link = await renderPreview()
    await act(async () => link.click())
    expect(document.querySelector('[data-section="attendance"]')).toBeNull()
    expect(document.querySelector('[data-section="description"]')).not.toBeNull()
    expect(mocks.time).toHaveBeenCalledWith(expect.objectContaining({ showAddToCalendar: true }))
  })

  it("keeps mobile and modified clicks as normal links", async () => {
    const link = await renderPreview()
    const prevented: boolean[] = []
    container.addEventListener("click", (click) => {
      prevented.push(click.defaultPrevented)
      click.preventDefault()
    })
    Object.assign(desktop, { matches: false })
    await act(async () => link.click())
    Object.assign(desktop, { matches: true })
    for (const modifier of ["ctrlKey", "metaKey", "shiftKey", "altKey"]) {
      await act(async () =>
        link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, [modifier]: true }))
      )
    }
    expect(prevented).toEqual([false, false, false, false, false])
    expect(mocks.query).not.toHaveBeenCalled()
    expect(document.querySelector('[role="dialog"]')).toBeNull()
  })

  it("closes when resized to mobile", async () => {
    const link = await renderPreview()
    await act(async () => link.click())
    Object.assign(desktop, { matches: false })
    await act(async () => resize?.())
    expect(document.querySelector('[role="dialog"]')).toBeNull()
  })

  it("closes with its button or Escape and restores focus to the event link", async () => {
    const link = await renderPreview()
    link.focus()
    await act(async () => link.click())
    const close = document.querySelector<HTMLButtonElement>('button[aria-label="Lukk arrangement"]')
    await act(async () => close?.click())
    expect(document.querySelector('[role="dialog"]')).toBeNull()
    expect(document.activeElement).toBe(link)

    await act(async () => link.click())
    await act(async () => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })))
    expect(document.querySelector('[role="dialog"]')).toBeNull()
    expect(document.activeElement).toBe(link)
  })

  it("keeps event links outside the event list as normal links", async () => {
    await act(async () =>
      root.render(
        <EventPreviewLink event={event} href="/arrangementer/testevent/event-one">
          Testevent
        </EventPreviewLink>
      )
    )
    let prevented = true
    container.addEventListener("click", (click) => {
      prevented = click.defaultPrevented
      click.preventDefault()
    })
    await act(async () => container.querySelector("a")?.click())
    expect(prevented).toBe(false)
    expect(mocks.query).not.toHaveBeenCalled()
  })

  it("shows a retry action if event loading fails", async () => {
    eventQuery = { data: null, isLoading: false, isError: true }
    const link = await renderPreview()
    await act(async () => link.click())
    const retry = Array.from(document.querySelectorAll("button")).find((button) => button.textContent === "Prøv igjen")
    await act(async () => retry?.click())
    expect(mocks.refetch).toHaveBeenCalledOnce()
  })

  it("copies the selected event's full page URL", async () => {
    const link = await renderPreview()

    await act(async () => link.click())

    const copy = Array.from(document.querySelectorAll("button")).find((button) => button.textContent === "Kopier lenke")

    await act(async () => copy?.click())

    expect(mocks.copy).toHaveBeenCalledWith("https://online.test/arrangementer/Testevent/event-one")
  })
})
