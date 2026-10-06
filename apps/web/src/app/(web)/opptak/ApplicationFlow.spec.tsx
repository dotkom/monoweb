// @vitest-environment jsdom

import type { CommitteeApplicationPeriodSummary } from "@dotkomonline/rpc/committee-application"
import type { User } from "@dotkomonline/rpc/user"
import React, { act, type ComponentProps } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ApplicationFlow } from "./ApplicationFlow"
import { createMockUser } from "../../../../.ladle/fixtures/attendance"

const auth = vi.hoisted(() => ({ dbUser: null as User | null }))
vi.mock("@/utils/use-authenticated-user", () => ({ useAuthenticatedUser: () => auth }))

vi.mock("@dotkomonline/ui", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@dotkomonline/ui")>()),
  Button: ({ variant, size, ...props }: ComponentProps<"button"> & { variant?: string; size?: string }) => (
    <button {...props} />
  ),
  Textarea: "textarea",
}))

const applicationPeriod: CommitteeApplicationPeriodSummary = {
  id: "period-id",
  name: "Komitéopptak",
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

beforeEach(async () => {
  auth.dbUser = null
  vi.stubGlobal("React", React)
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
  await act(async () => root.render(<ApplicationFlow applicationPeriod={applicationPeriod} />))
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function findButton(text: string) {
  const button = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === text)

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

describe("committee application first steps", () => {
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
    await act(async () => root.render(<ApplicationFlow applicationPeriod={applicationPeriod} />))
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
