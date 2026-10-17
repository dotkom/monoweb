// @vitest-environment jsdom

import type { CommitteeApplication, CommitteeApplicationOpenPeriod } from "@dotkomonline/rpc/committee-application"
import type { User } from "@dotkomonline/rpc/user"
import type { EventClickArg } from "@fullcalendar/core"
import FullCalendar from "@fullcalendar/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React, { act, type ComponentProps, type ReactNode } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ApplicationFlow } from "./ApplicationFlow"
import { createMockUser } from "../../../../.ladle/fixtures/attendance"

const auth = vi.hoisted(() => ({ dbUser: null as User | null }))
vi.mock("@/utils/use-authenticated-user", () => ({ useAuthenticatedUser: () => auth }))

const submissionControls = vi.hoisted(() => ({ submit: vi.fn(), update: vi.fn(), replace: vi.fn(), refresh: vi.fn() }))
vi.mock("next/navigation", () => ({ useRouter: () => submissionControls }))
vi.mock("@/utils/trpc/client", () => ({
  useTRPC: () => ({
    committeeApplication: {
      submitApplication: {
        mutationOptions: (options: object) => ({ mutationFn: submissionControls.submit, ...options }),
      },
      updateApplication: {
        mutationOptions: (options: object) => ({ mutationFn: submissionControls.update, ...options }),
      },
    },
  }),
}))

vi.mock("@dotkomonline/ui", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@dotkomonline/ui")>()),
  Button: ({
    variant,
    size,
    icon,
    children,
    ...props
  }: ComponentProps<"button"> & { variant?: string; size?: string; icon?: ReactNode }) => (
    <button {...props}>
      {icon}
      {children}
    </button>
  ),
  Textarea: "textarea",
}))

const applicationPeriod: CommitteeApplicationOpenPeriod = {
  id: "period-id",
  name: "Komitéopptak",
  applicationsCloseAt: new Date("2026-10-10T20:00:00Z"),
  interviewsStartDate: new Date("2026-10-11"),
  interviewsEndDate: new Date("2026-10-15"),
  groups: [
    {
      id: "exclusive-one",
      name: "Komité én",
      type: "EXCLUSIVE",
      description: "<p>Vi utvikler nettsider og drifter tjenester.</p><p>Hele beskrivelsen vises i dialogen.</p>",
      imageUrl: "https://example.com/group-logo.png",
    },
    { id: "additive-one", name: "Gruppe én", type: "ADDITIVE", description: "", imageUrl: null },
    { id: "exclusive-two", name: "Komité to", type: "EXCLUSIVE", description: "", imageUrl: null },
    { id: "exclusive-three", name: "Komité tre", type: "EXCLUSIVE", description: "", imageUrl: null },
    { id: "additive-two", name: "Gruppe to", type: "ADDITIVE", description: "", imageUrl: null },
    { id: "exclusive-four", name: "Komité fire", type: "EXCLUSIVE", description: "", imageUrl: null },
  ],
}

let container: HTMLDivElement
let root: Root
let queryClient: QueryClient

function renderFlow(application?: CommitteeApplication) {
  root.render(
    <QueryClientProvider client={queryClient}>
      <ApplicationFlow key={application?.id} applicationPeriod={applicationPeriod} application={application} />
    </QueryClientProvider>
  )
}

beforeEach(async () => {
  auth.dbUser = null
  submissionControls.submit.mockReset().mockResolvedValue({ id: "saved-id" })
  submissionControls.update.mockReset().mockResolvedValue({ id: "saved-id" })
  submissionControls.replace.mockClear()
  submissionControls.refresh.mockClear()
  queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  vi.stubGlobal("React", React)
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
  await act(async () => renderFlow())
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
  queryClient.clear()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function findButton(text: string) {
  const button = Array.from(document.querySelectorAll("button")).find((button) => button.textContent === text)

  if (button === undefined) {
    throw new Error(`Button ${text} not found`)
  }

  return button
}

function findGroup(groupId: string) {
  const checkbox = container.querySelector<HTMLInputElement>(`input[value="${groupId}"]`)

  if (checkbox === null) {
    throw new Error(`Group ${groupId} not found`)
  }

  return checkbox
}

async function clickButton(text: string) {
  await act(async () => findButton(text).click())
}

async function toggleGroup(groupId: string) {
  await act(async () => findGroup(groupId).click())
}

async function setInputValue(selector: string, value: string) {
  const input = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector)

  if (input === null) {
    throw new Error(`Input ${selector} not found`)
  }

  const prototype = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  await act(async () => {
    Object.getOwnPropertyDescriptor(prototype, "value")?.set?.call(input, value)
    input.dispatchEvent(new Event("input", { bubbles: true }))
    input.dispatchEvent(new Event("change", { bubbles: true }))
  })
}

describe("committee application first steps", () => {
  it("adds, preserves, summarizes and removes interview availability", async () => {
    const calendars: ReturnType<FullCalendar["getApi"]>[] = []
    const mountCalendar = FullCalendar.prototype.componentDidMount
    vi.spyOn(FullCalendar.prototype, "componentDidMount").mockImplementation(function (this: FullCalendar) {
      mountCalendar.call(this)
      calendars.push(this.getApi())
    })
    await clickButton("Neste")
    await toggleGroup("additive-one")
    await clickButton("Neste")
    await clickButton("2. år")
    await setInputValue("#about-me", "Jeg ønsker å bli med.")
    await clickButton("Neste")

    expect(container.querySelector("h1")?.textContent).toBe("Tilgjengelighet")
    expect(container.querySelector(".fc-interviewPeriod-view")).not.toBeNull()
    expect(container.querySelector(".fc-header-toolbar")).toBeNull()
    expect(
      Array.from(container.querySelectorAll(".fc-col-header-cell")).map((day) => day.getAttribute("data-date"))
    ).toEqual(["2026-10-11", "2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15"])
    expect(container.textContent).toContain("09:00 og 17:00")
    expect(findButton("Neste").disabled).toBe(true)
    expect(container.textContent).not.toContain("Valgte tider")
    expect(document.querySelector("#availability-date")).toBeNull()
    await clickButton("Legg til tidspunkt manuelt")
    expect(document.querySelector('[role="dialog"]')).not.toBeNull()
    expect(document.querySelector("#availability-date")?.getAttribute("min")).toBe("2026-10-11")
    expect(document.querySelector("#availability-date")?.getAttribute("max")).toBe("2026-10-15")
    await clickButton("Avbryt")
    expect(document.querySelector('[role="dialog"]')).toBeNull()
    expect(findButton("Neste").disabled).toBe(true)
    await clickButton("Legg til tidspunkt manuelt")

    const calendar = calendars[0]
    expect(calendar.getOption("timeZone")).toBe("Europe/Oslo")
    expect(calendar.getOption("slotMinTime")).toBe("09:00")
    expect(calendar.getOption("slotMaxTime")).toBe("17:00")
    expect(calendar.getOption("validRange")).toEqual({ start: "2026-10-11", end: "2026-10-16" })
    expect(calendar.getOption("visibleRange")).toEqual({ start: "2026-10-11", end: "2026-10-16" })

    await setInputValue("#availability-start", "08:00")
    await clickButton("Legg til tidsrom")
    expect(document.querySelector('[role="alert"]')).not.toBeNull()
    expect(findButton("Neste").disabled).toBe(true)

    await setInputValue("#availability-date", "2026-10-15")
    await setInputValue("#availability-start", "09:00")
    await setInputValue("#availability-end", "17:00")
    await clickButton("Legg til tidsrom")
    expect(document.querySelector('[role="dialog"]')).toBeNull()
    expect(document.querySelector('[role="alert"]')).toBeNull()
    expect(container.querySelector("h1")?.textContent).toBe("Tilgjengelighet")
    expect(calendar.getEvents()).toHaveLength(1)
    expect(calendar.getEvents()[0].startStr).toBe("2026-10-15T09:00:00")
    expect(calendar.getEvents()[0].extendedProps.availabilityLabel).toBe("torsdag 15. oktober, 09:00–17:00")
    expect(findButton("Neste").disabled).toBe(false)

    await clickButton("Tilbake")
    await clickButton("Neste")
    expect(calendars[calendars.length - 1].getEvents()[0].extendedProps.availabilityLabel).toBe(
      "torsdag 15. oktober, 09:00–17:00"
    )
    await clickButton("Neste")
    await clickButton("Neste")
    expect(container.querySelector("h1")?.textContent).toBe("Oppsummering")
    expect(container.textContent).toContain("torsdag 15. oktober, 09:00–17:00")

    await clickButton("Tilbake")
    await clickButton("Tilbake")

    const remountedCalendar = calendars[calendars.length - 1]
    await act(async () => {
      remountedCalendar.getOption("eventClick")?.({
        event: remountedCalendar.getEvents()[0] as EventClickArg["event"],
        el: document.createElement("a"),
        jsEvent: new MouseEvent("click"),
        view: remountedCalendar.view,
      })
    })
    expect(findButton("Neste").disabled).toBe(true)
    expect(remountedCalendar.getEvents()).toHaveLength(0)
    await act(async () => remountedCalendar.select("2026-10-11T09:00:00", "2026-10-11T10:30:00"))
    expect(remountedCalendar.getEvents()[0].extendedProps.availabilityLabel).toBe("søndag 11. oktober, 09:00–10:30")
    expect(findButton("Neste").disabled).toBe(false)
    await act(async () => remountedCalendar.select("2026-10-11T10:00:00", "2026-10-11T11:00:00"))
    expect(remountedCalendar.getEvents()[0].extendedProps.availabilityLabel).toBe("søndag 11. oktober, 09:00–11:00")
    expect(remountedCalendar.getEvents()).toHaveLength(1)
  })

  it("starts on information and requires a group selection before continuing", async () => {
    expect(container.querySelector("h1")?.textContent).toBe("Informasjon")
    expect(container.querySelector('button[type="button"]')).toBeNull()
    expect(container.querySelector('input[type="checkbox"]')).toBeNull()

    await clickButton("Neste")

    expect(container.querySelector("h1")?.textContent).toBe("Velg komiteer")
    expect(document.activeElement).toBe(container.querySelector("h1"))
    expect(findButton("Neste").disabled).toBe(true)
    expect(container.querySelectorAll("fieldset")[0].querySelectorAll("input")).toHaveLength(4)
    expect(container.querySelectorAll("fieldset")[1].querySelectorAll("input")).toHaveLength(2)

    await act(async () => {
      container.querySelector("form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))
    })
    expect(container.querySelector("h1")?.textContent).toBe("Velg komiteer")

    await toggleGroup("exclusive-one")
    expect(findButton("Neste").disabled).toBe(false)
    await toggleGroup("exclusive-one")
    expect(findButton("Neste").disabled).toBe(true)
  })

  it("limits exclusive selections to three while allowing all additive groups", async () => {
    await clickButton("Neste")
    const limitMessage = "Du har valgt maksimalt antall komiteer."
    expect(container.textContent).not.toContain(limitMessage)
    await toggleGroup("exclusive-one")
    await toggleGroup("exclusive-two")
    expect(container.textContent).not.toContain(limitMessage)
    await toggleGroup("exclusive-three")
    expect(container.textContent).toContain(limitMessage)

    expect(findGroup("exclusive-four").disabled).toBe(true)
    expect(findGroup("exclusive-one").disabled).toBe(false)
    await toggleGroup("exclusive-four")
    expect(findGroup("exclusive-four").checked).toBe(false)

    await toggleGroup("additive-one")
    await toggleGroup("additive-two")
    expect(container.querySelectorAll("input:checked")).toHaveLength(5)
    expect(findButton("Neste").disabled).toBe(false)

    await toggleGroup("exclusive-two")
    expect(container.textContent).not.toContain(limitMessage)
    expect(findGroup("exclusive-four").disabled).toBe(false)
    await toggleGroup("exclusive-four")
    expect(container.querySelectorAll("input:checked")).toHaveLength(5)

    await clickButton("Tilbake")
    expect(container.querySelector("h1")?.textContent).toBe("Informasjon")
    await clickButton("Neste")
    expect(findGroup("exclusive-four").checked).toBe(true)
    expect(findGroup("additive-one").checked).toBe(true)
    expect(container.querySelectorAll("input:checked")).toHaveLength(5)
  })

  it("allows continuing with only additive groups and preserves selections from the next step", async () => {
    await clickButton("Neste")
    await toggleGroup("additive-one")
    await toggleGroup("additive-two")
    expect(findButton("Neste").disabled).toBe(false)

    await clickButton("Neste")
    expect(container.querySelector("h1")?.textContent).toBe("Søknad")
    await clickButton("Tilbake")
    expect(findGroup("additive-one").checked).toBe(true)
    expect(findGroup("additive-two").checked).toBe(true)
    expect(findButton("Neste").disabled).toBe(false)
  })

  it("uses year buttons without a default when there is no membership and preserves the chosen year", async () => {
    await clickButton("Neste")
    await toggleGroup("additive-one")
    await clickButton("Neste")
    expect(container.querySelector('input[type="radio"]')).toBeNull()
    expect(container.querySelectorAll('[data-slot="toggle-group-item"]')).toHaveLength(5)
    expect(container.querySelector('[aria-pressed="true"]')).toBeNull()

    await clickButton("2. år")
    expect(findButton("2. år").getAttribute("aria-pressed")).toBe("true")
    expect(container.querySelector("h1")?.textContent).toBe("Søknad")
    await clickButton("2. år")
    expect(findButton("2. år").getAttribute("aria-pressed")).toBe("true")
    await clickButton("Tilbake")
    await clickButton("Neste")
    expect(findButton("2. år").getAttribute("aria-pressed")).toBe("true")

    const user = createMockUser()
    auth.dbUser = { ...user, memberships: user.memberships.map((membership) => ({ ...membership, semester: 8 })) }
    await act(async () => renderFlow())
    expect(findButton("2. år").getAttribute("aria-pressed")).toBe("true")
  })

  it.each([
    [0, 1],
    [4, 3],
    [9, 5],
  ])("defaults to study year %i's membership semester mapped to year %i", async (semester, year) => {
    const user = createMockUser()
    auth.dbUser = { ...user, memberships: user.memberships.map((membership) => ({ ...membership, semester })) }
    await clickButton("Neste")
    await toggleGroup("additive-one")
    await clickButton("Neste")
    expect(findButton(`${year}. år`).getAttribute("aria-pressed")).toBe("true")
    expect(container.querySelectorAll('[aria-pressed="true"]')).toHaveLength(1)
    await clickButton("4. år")
    expect(findButton("4. år").getAttribute("aria-pressed")).toBe("true")
  })

  it.each([null, 10])("leaves the year unselected for a membership semester of %s", async (semester) => {
    const user = createMockUser()
    auth.dbUser = { ...user, memberships: user.memberships.map((membership) => ({ ...membership, semester })) }
    await clickButton("Neste")
    await toggleGroup("additive-one")
    await clickButton("Neste")
    expect(container.querySelector('[aria-pressed="true"]')).toBeNull()
  })

  it("selects through the card and opens full group details without changing selections", async () => {
    await clickButton("Neste")
    const checkbox = findGroup("exclusive-one")
    const card = checkbox.parentElement
    expect(card?.querySelector('img[alt="Komité én"]')?.getAttribute("src")).toContain("group-logo.png")
    expect(card?.textContent).toContain("Vi utvikler nettsider og drifter tjenester.")

    await act(async () => card?.querySelector("label")?.click())
    expect(checkbox.checked).toBe(true)
    await act(async () => card?.querySelector("label")?.click())
    expect(checkbox.checked).toBe(false)

    const detailsButton = card?.querySelector<HTMLButtonElement>('button[aria-label="Les mer om Komité én"]')
    await act(async () => detailsButton?.click())
    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog?.textContent).toContain("Hele beskrivelsen vises i dialogen.")
    expect(dialog?.querySelector('img[alt="Komité én"]')).not.toBeNull()
    expect(checkbox.checked).toBe(false)
    expect(container.querySelector("h1")?.textContent).toBe("Velg komiteer")
    await act(async () => dialog?.querySelector<HTMLButtonElement>("button")?.click())
    expect(document.querySelector('[role="dialog"]')).toBeNull()

    await toggleGroup("exclusive-two")
    await toggleGroup("exclusive-three")
    await toggleGroup("exclusive-four")
    expect(checkbox.disabled).toBe(true)
    expect(detailsButton?.disabled).toBe(false)
    await act(async () => detailsButton?.click())
    expect(document.querySelector('[role="dialog"]')).not.toBeNull()
    expect(checkbox.checked).toBe(false)
  })

  it("shuffles the groups once and keeps their order while selecting", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0)
    await clickButton("Neste")

    const getGroupOrder = () =>
      Array.from(container.querySelectorAll<HTMLInputElement>('input[name="applicationGroups"]')).map(
        (input) => input.value
      )
    const groupOrder = getGroupOrder()
    expect(groupOrder).toEqual([
      "exclusive-two",
      "exclusive-three",
      "exclusive-four",
      "exclusive-one",
      "additive-one",
      "additive-two",
    ])
    const randomCalls = vi.mocked(Math.random).mock.calls.length
    await toggleGroup("exclusive-one")
    expect(getGroupOrder()).toEqual(groupOrder)
    expect(vi.mocked(Math.random).mock.calls).toHaveLength(randomCalls)
    expect(applicationPeriod.groups.map((group) => group.id)).toEqual([
      "exclusive-one",
      "additive-one",
      "exclusive-two",
      "exclusive-three",
      "additive-two",
      "exclusive-four",
    ])
  })
})

async function completeApplication() {
  await clickButton("Neste")
  await toggleGroup("exclusive-one")
  await toggleGroup("additive-one")
  await toggleGroup("exclusive-two")
  await clickButton("Neste")
  await clickButton("2. år")
  await setInputValue("#about-me", "Jeg ønsker å bli med.")
  await clickButton("Neste")
  await clickButton("Legg til tidspunkt manuelt")
  await setInputValue("#availability-date", "2026-10-12")
  await setInputValue("#availability-start", "09:00")
  await setInputValue("#availability-end", "17:00")
  await clickButton("Legg til tidsrom")
  await clickButton("Neste")
  await act(async () => container.querySelector<HTMLButtonElement>('button[aria-label="Flytt Komité to opp"]')?.click())
  await clickButton("Neste")
}

describe("application submission", () => {
  it("prefills a submitted application and saves edits through the update action", async () => {
    auth.dbUser = createMockUser()
    const application: CommitteeApplication = {
      id: "saved-id",
      userId: auth.dbUser.id,
      applicationPeriodId: applicationPeriod.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      aboutMe: "Min opprinnelige søknad",
      studyYear: 3,
      groupSelections: [
        {
          id: "selection-one",
          applicationId: "saved-id",
          applicationPeriodId: applicationPeriod.id,
          applicationGroupId: "exclusive-one",
          rank: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "selection-additive",
          applicationId: "saved-id",
          applicationPeriodId: applicationPeriod.id,
          applicationGroupId: "additive-one",
          rank: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      availabilityBlocks: [
        {
          id: "availability",
          applicationId: "saved-id",
          createdAt: new Date(),
          updatedAt: new Date(),
          startsAt: new Date("2026-10-12T07:00:00Z"),
          endsAt: new Date("2026-10-12T15:00:00Z"),
        },
      ],
    }
    await act(async () => renderFlow(application))
    await clickButton("Neste")
    expect(findGroup("exclusive-one").checked).toBe(true)
    expect(findGroup("additive-one").checked).toBe(true)
    await clickButton("Neste")
    expect(container.querySelector<HTMLTextAreaElement>("textarea")?.value).toBe(application.aboutMe)
    expect(findButton("3. år").getAttribute("aria-pressed")).toBe("true")
    await clickButton("4. år")
    await clickButton("Neste")
    await clickButton("Neste")
    await clickButton("Neste")
    await clickButton("Lagre endringer")
    expect(submissionControls.update).toHaveBeenCalledWith(
      expect.objectContaining({
        applicationId: application.id,
        application: {
          aboutMe: application.aboutMe,
          studyYear: 4,
          groupSelections: [
            { applicationGroupId: "exclusive-one", rank: 1 },
            { applicationGroupId: "additive-one", rank: null },
          ],
          interviewAvailability: application.availabilityBlocks.map((availability) => ({
            startsAt: availability.startsAt,
            endsAt: availability.endsAt,
          })),
        },
      }),
      expect.anything()
    )
    expect(submissionControls.submit).not.toHaveBeenCalled()
    expect(submissionControls.replace).toHaveBeenCalledWith("/opptak/intervjuer")
  })
  it("sends the complete application, blocks duplicate clicks and navigates only after success", async () => {
    auth.dbUser = createMockUser()
    await act(async () => renderFlow())
    await completeApplication()
    const rankedGroups = Array.from(container.querySelectorAll("ol li")).map((group) => group.textContent)
    expect(rankedGroups).toEqual(["Komité to", "Komité én"])
    expect(container.textContent).toContain("Andre grupper")
    expect(container.textContent).toContain("Gruppe én")
    await clickButton("Tilbake")
    expect(container.querySelector('[aria-label="Flytt Gruppe én opp"]')).toBeNull()
    expect(container.querySelector('[aria-label="Flytt Gruppe én ned"]')).toBeNull()
    expect(container.querySelector('[aria-label="Flytt Komité to opp"]')?.hasAttribute("disabled")).toBe(true)
    expect(container.querySelector('[aria-label="Flytt Komité én ned"]')?.hasAttribute("disabled")).toBe(true)
    await clickButton("Neste")
    let resolveSubmission: ((value: { id: string }) => void) | undefined
    submissionControls.submit.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSubmission = resolve
        })
    )

    await clickButton("Send søknad")
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
    expect(findButton("Sender søknaden…").disabled).toBe(true)
    expect(findButton("Tilbake").disabled).toBe(true)
    await act(async () =>
      container.querySelector("form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))
    )
    expect(submissionControls.submit).toHaveBeenCalledTimes(1)
    expect(submissionControls.submit.mock.calls[0][0]).toEqual({
      applicationPeriodId: "period-id",
      aboutMe: "Jeg ønsker å bli med.",
      studyYear: 2,
      groupSelections: [
        { applicationGroupId: "exclusive-two", rank: 1 },
        { applicationGroupId: "exclusive-one", rank: 2 },
        { applicationGroupId: "additive-one", rank: null },
      ],
      interviewAvailability: [{ startsAt: new Date("2026-10-12T07:00:00Z"), endsAt: new Date("2026-10-12T15:00:00Z") }],
    })
    expect(submissionControls.replace).not.toHaveBeenCalled()
    await act(async () => {
      resolveSubmission?.({ id: "saved-id" })
    })
    expect(submissionControls.replace).toHaveBeenCalledWith("/opptak/intervjuer")
    expect(submissionControls.refresh).toHaveBeenCalledOnce()
  })

  it("keeps the summary and its data after a failure and allows retry", async () => {
    auth.dbUser = createMockUser()
    await act(async () => renderFlow())
    await completeApplication()
    submissionControls.submit.mockRejectedValueOnce(new Error("Nettverksfeil"))

    await clickButton("Send søknad")
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
    expect(container.querySelector('[role="alert"]')?.textContent).toContain("Nettverksfeil")
    expect(container.querySelector("h1")?.textContent).toBe("Oppsummering")
    expect(container.textContent).toContain("Jeg ønsker å bli med.")
    expect(findButton("Send søknad").disabled).toBe(false)
    expect(submissionControls.replace).not.toHaveBeenCalled()

    await clickButton("Send søknad")
    expect(submissionControls.submit).toHaveBeenCalledTimes(2)
    expect(submissionControls.submit.mock.calls[1][0]).toEqual(submissionControls.submit.mock.calls[0][0])
    expect(submissionControls.replace).toHaveBeenCalledWith("/opptak/intervjuer")
  })

  it("requires a local authenticated user before sending", async () => {
    await completeApplication()

    expect(findButton("Send søknad").disabled).toBe(true)
    expect(container.querySelector('[role="alert"]')?.textContent).toContain("Du må være logget inn")
    await act(async () =>
      container.querySelector("form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))
    )
    expect(submissionControls.submit).not.toHaveBeenCalled()
  })
})
