// @vitest-environment jsdom

import { PoolForm, type PoolFormValues } from "@admin/arrangementer/[id]/pamelding/components/PoolForm"
import React, { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@admin/lib/notifications", () => ({ notifyFail: vi.fn() }))

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  vi.stubGlobal("React", React)
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
  container = document.createElement("div")
  document.body.append(container)
  root = createRoot(container)
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
  vi.unstubAllGlobals()
})

async function renderForm(mode: "create" | "update" = "update") {
  const onSubmit = vi.fn<(values: PoolFormValues) => void>()

  await act(async () => {
    root.render(
      <PoolForm
        mode={mode}
        defaultValues={{ capacity: 10, yearCriteria: [1], title: "Group", mergeDelayHours: null }}
        disabledYears={[]}
        onSubmit={onSubmit}
        onClose={vi.fn()}
      />
    )
  })

  return onSubmit
}

async function changeCapacity(capacity: string) {
  const input = container.querySelector<HTMLInputElement>("#capacity")

  if (input === null) {
    throw new Error("Capacity input is missing")
  }

  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, capacity)
    input.dispatchEvent(new Event("input", { bubbles: true }))
  })
}

async function submitForm() {
  await act(async () => {
    container.querySelector("form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))
  })
}

describe("filling added seats in the pool form", () => {
  it("shows an opt-in toggle on a capacity increase and submits the chosen value", async () => {
    const onSubmit = await renderForm()
    expect(container.querySelector('[role="switch"]')).toBeNull()

    await changeCapacity("12")

    const toggle = container.querySelector<HTMLButtonElement>('[role="switch"]')
    expect(toggle?.getAttribute("aria-checked")).toBe("false")
    expect(container.textContent).toContain("Fyll nye plasser fra køen")
    expect(container.textContent).toContain("e-post")

    await act(async () => toggle?.click())
    await submitForm()

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ capacity: 12, fillAddedSeats: true }))
  })

  it("keeps filling disabled unless the organizer enables it", async () => {
    const onSubmit = await renderForm()

    await changeCapacity("12")
    await submitForm()

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ capacity: 12, fillAddedSeats: false }))
  })

  it("does not submit a stale enabled toggle after the capacity increase is reverted", async () => {
    const onSubmit = await renderForm()
    await changeCapacity("12")
    await act(async () => container.querySelector<HTMLButtonElement>('[role="switch"]')?.click())

    await changeCapacity("10")
    expect(container.querySelector('[role="switch"]')).toBeNull()
    await submitForm()

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ capacity: 10, fillAddedSeats: false }))
  })

  it("offers to fill the queue when capacity becomes unlimited", async () => {
    await renderForm()
    await changeCapacity("")

    expect(container.querySelector('[role="switch"]')).not.toBeNull()
  })

  it("does not offer queue filling when creating a group", async () => {
    await renderForm("create")
    await changeCapacity("12")

    expect(container.querySelector('[role="switch"]')).toBeNull()
  })
})
