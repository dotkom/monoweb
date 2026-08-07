// @vitest-environment jsdom

import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { z } from "zod"
import { useFormBuilder } from "./Form"

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

describe("useFormBuilder", () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  it("returns the same form component across owner rerenders", () => {
    const formComponents: ReturnType<typeof useFormBuilder>[] = []

    function FormBuilderHarness({ label }: { label: string }) {
      const FormComponent = useFormBuilder({
        schema: z.object({}),
        fields: {},
        label,
        onSubmit: () => undefined,
      })

      formComponents.push(FormComponent)
      return null
    }

    act(() => root.render(createElement(FormBuilderHarness, { label: "First render" })))
    const firstFormComponent = formComponents.at(-1)

    act(() => root.render(createElement(FormBuilderHarness, { label: "Second render" })))
    const secondFormComponent = formComponents.at(-1)

    expect(secondFormComponent).toBe(firstFormComponent)
  })
})
