// @vitest-environment jsdom

import * as React from "react"
import { act, createElement, type ReactNode } from "react"
import { createRoot, type Root } from "react-dom/client"
import { useForm } from "react-hook-form"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useRichTextInput } from "./RichTextInput"

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true, React })

interface ImageUploadModalProperties {
  handleSubmit: (imageUrl: string, alternativeText: string, title: string | undefined) => Promise<void>
}

interface EditorCommandChain {
  setTextSelection: ReturnType<typeof vi.fn>
  focus: ReturnType<typeof vi.fn>
  setImage: ReturnType<typeof vi.fn>
  run: ReturnType<typeof vi.fn>
}

interface TestEditor {
  isDestroyed: boolean
  state: { selection: { from: number; to: number } }
  setEditable: ReturnType<typeof vi.fn>
  chain: ReturnType<typeof vi.fn>
  commandChain: EditorCommandChain
}

const testState = vi.hoisted(() => ({
  currentEditor: undefined as TestEditor | undefined,
  openedModalProperties: undefined as ImageUploadModalProperties | undefined,
}))

vi.mock("@/components/ImageUploadModal", () => ({
  useUploadImageModal: (properties: ImageUploadModalProperties) => () => {
    testState.openedModalProperties = properties
  },
}))

vi.mock("@mantine/core", async () => {
  const { createElement: createReactElement } = await import("react")
  const PassThrough = ({ children }: { children?: ReactNode }) => children ?? null
  const Input = Object.assign(PassThrough, {
    Wrapper: PassThrough,
    Label: PassThrough,
  })

  return {
    Divider: () => null,
    Input,
    Button: ({ children }: { children?: ReactNode }) => createReactElement("button", null, children),
  }
})

vi.mock("@mantine/tiptap", async () => {
  const { createElement: createReactElement } = await import("react")
  const PassThrough = ({ children }: { children?: ReactNode }) => children ?? null
  const EmptyControl = () => null
  const RichTextEditor = Object.assign(PassThrough, {
    Toolbar: PassThrough,
    ControlsGroup: PassThrough,
    Control: ({
      children,
      onClick,
      "aria-label": ariaLabel,
      title,
    }: {
      children?: ReactNode
      onClick?: () => void
      "aria-label"?: string
      title?: string
    }) => createReactElement("button", { type: "button", onClick, "aria-label": ariaLabel, title }, children),
    Content: EmptyControl,
    Undo: EmptyControl,
    Redo: EmptyControl,
    ClearFormatting: EmptyControl,
    Bold: EmptyControl,
    Italic: EmptyControl,
    Underline: EmptyControl,
    Strikethrough: EmptyControl,
    CodeBlock: EmptyControl,
    Link: EmptyControl,
    Unlink: EmptyControl,
    H2: EmptyControl,
    H3: EmptyControl,
    H4: EmptyControl,
    BulletList: EmptyControl,
    OrderedList: EmptyControl,
    Hr: EmptyControl,
  })

  return { RichTextEditor }
})

vi.mock("@/components/forms/RichTextInput/TableActionButtons", () => ({
  AddColumnAfter: () => null,
  AddRowAfter: () => null,
  DeleteColumn: () => null,
  DeleteRow: () => null,
  DeleteTable: () => null,
  InsertTableControl: () => null,
  MergeCells: () => null,
  SplitCell: () => null,
  ToggleHeaderColumn: () => null,
  ToggleHeaderRow: () => null,
}))

vi.mock("@tiptap/react", () => ({
  useEditor: (configuration: { onSelectionUpdate?: (update: { editor: TestEditor }) => void }) => {
    const editor = testState.currentEditor

    if (!editor) {
      throw new Error("Missing editor instance for test")
    }

    configuration.onSelectionUpdate?.({ editor })
    return editor
  },
}))

function createTestEditor(): TestEditor {
  const commandChain = {} as EditorCommandChain
  commandChain.setTextSelection = vi.fn(() => commandChain)
  commandChain.focus = vi.fn(() => commandChain)
  commandChain.setImage = vi.fn(() => commandChain)
  commandChain.run = vi.fn(() => true)

  return {
    isDestroyed: false,
    state: { selection: { from: 4, to: 4 } },
    setEditable: vi.fn(),
    chain: vi.fn(() => commandChain),
    commandChain,
  }
}

describe("useRichTextInput", () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
    testState.currentEditor = undefined
    testState.openedModalProperties = undefined
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  it("inserts an uploaded image into the replacement editor after the form owner rerenders", async () => {
    const firstEditor = createTestEditor()
    const replacementEditor = createTestEditor()
    testState.currentEditor = firstEditor

    function RichTextInputHarness({ renderNumber }: { renderNumber: number }) {
      const form = useForm<{ content: string }>({
        defaultValues: { content: "<p>Existing content</p>" },
      })
      const RichTextInput = useRichTextInput<{ content: string }>({
        label: `Content ${renderNumber}`,
        required: true,
        onFileUpload: async () => "https://cdn.example.com/uploaded-image.jpg",
      })

      return createElement(RichTextInput, {
        name: "content",
        control: form.control,
        state: form.formState,
        defaultValue: "<p>Existing content</p>",
        register: form.register,
        setValue: form.setValue,
        getValues: form.getValues,
        setError: form.setError,
        clearErrors: form.clearErrors,
      })
    }

    act(() => root.render(createElement(RichTextInputHarness, { renderNumber: 1 })))
    const insertImageButton = container.querySelector<HTMLButtonElement>('button[aria-label="Insert image"]')

    if (!insertImageButton) {
      throw new Error("Missing insert image button")
    }

    act(() => insertImageButton.click())
    const openedModalProperties = testState.openedModalProperties

    if (!openedModalProperties) {
      throw new Error("Image upload modal did not open")
    }

    testState.currentEditor = replacementEditor
    act(() => root.render(createElement(RichTextInputHarness, { renderNumber: 2 })))

    await act(() =>
      openedModalProperties.handleSubmit("https://cdn.example.com/uploaded-image.jpg", "Uploaded image", "Image title")
    )

    expect(firstEditor.chain).not.toHaveBeenCalled()
    expect(replacementEditor.chain).toHaveBeenCalledOnce()
    expect(replacementEditor.commandChain.setTextSelection).toHaveBeenCalledWith({ from: 4, to: 4 })
    expect(replacementEditor.commandChain.focus).toHaveBeenCalledOnce()
    expect(replacementEditor.commandChain.setImage).toHaveBeenCalledWith({
      src: "https://cdn.example.com/uploaded-image.jpg",
      alt: "Uploaded image",
      title: "Image title",
      width: 710,
    })
    expect(replacementEditor.commandChain.run).toHaveBeenCalledOnce()
  })

  it("returns a stable field component across form owner rerenders", () => {
    const fieldComponents: Array<ReturnType<typeof useRichTextInput<{ content: string }>>> = []
    testState.currentEditor = createTestEditor()

    function RichTextInputHarness() {
      const form = useForm<{ content: string }>({
        defaultValues: { content: "<p>Existing content</p>" },
      })
      const RichTextInput = useRichTextInput<{ content: string }>({
        label: "Content",
        required: false,
      })
      fieldComponents.push(RichTextInput)

      return createElement(RichTextInput, {
        name: "content",
        control: form.control,
        state: form.formState,
        defaultValue: "<p>Existing content</p>",
        register: form.register,
        setValue: form.setValue,
        getValues: form.getValues,
        setError: form.setError,
        clearErrors: form.clearErrors,
      })
    }

    act(() => root.render(createElement(RichTextInputHarness)))
    act(() => root.render(createElement(RichTextInputHarness)))

    expect(fieldComponents.length).toBeGreaterThanOrEqual(2)
    expect(fieldComponents.every((fieldComponent) => fieldComponent === fieldComponents[0])).toBe(true)
  })
})
