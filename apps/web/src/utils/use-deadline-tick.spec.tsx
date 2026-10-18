// @vitest-environment jsdom

import { addDays, addSeconds } from "date-fns"
import React, { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useDeadlineTick } from "./use-deadline-tick"

let container: HTMLDivElement
let root: Root

function DeadlineDisplay({ deadlines }: { deadlines: Date[] }) {
  const tick = useDeadlineTick(...deadlines)
  return <p>{tick}</p>
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal("React", React)
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
  container = document.createElement("div")
  document.body.append(container)
  root = createRoot(container)
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe("deadline updates", () => {
  it("updates at each boundary without another render or network response", async () => {
    const now = Date.now()
    await act(async () => {
      root.render(<DeadlineDisplay deadlines={[addSeconds(now, 1), addSeconds(now, 2), addSeconds(now, 3)]} />)
    })

    for (const expectedTick of [1, 2, 3]) {
      await act(async () => vi.advanceTimersByTime(1_050))
      expect(container.textContent).toBe(String(expectedTick))
    }

    expect(vi.getTimerCount()).toBe(0)
  })

  it("schedules faraway deadlines without overflowing the browser timeout limit", async () => {
    const timeoutSpy = vi.spyOn(globalThis, "setTimeout")
    const deadline = addDays(new Date(), 30)
    await act(async () => root.render(<DeadlineDisplay deadlines={[deadline]} />))

    expect(timeoutSpy).toHaveBeenLastCalledWith(expect.any(Function), 2 ** 31 - 1)
    await act(async () => vi.advanceTimersByTime(2 ** 31 - 1))
    expect(timeoutSpy).toHaveBeenLastCalledWith(expect.any(Function), expect.any(Number))
    expect(vi.getTimerCount()).toBe(1)
    timeoutSpy.mockRestore()
  })
})
