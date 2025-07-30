"use client"

import { Icon } from "@iconify/react"
import { Divider, Input } from "@mantine/core"
import { RichTextEditor, type RichTextEditorProps, useRichTextEditorContext } from "@mantine/tiptap"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import { useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Controller, type FieldValues } from "react-hook-form"
import type { InputProducerResult } from "./types"
import "@mantine/tiptap/styles.css"

export function createRichTextInput<F extends FieldValues>({
  onChange,
  required,
  label,
  ...props
}: Omit<RichTextEditorProps, "error" | "children" | "editor"> & {
  required: boolean
  label: string
}): InputProducerResult<F> {
  return function RichTextInput({ name, control }) {
    return (
      <Input.Wrapper>
        <Input.Label required={required}>{label}</Input.Label>
        <Controller
          control={control}
          name={name}
          render={({ field }) => {
            const editor = useEditor({
              extensions: [StarterKit, Underline, Link],
              content: field.value,
              immediatelyRender: false,
              onUpdate: (value) => field.onChange(value.editor.getHTML()),
            })

            return (
              <RichTextEditor {...props} editor={editor} variant="subtle">
                <RichTextEditor.Toolbar sticky stickyOffset={60}>
                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Undo />
                    <RichTextEditor.Redo />
                  </RichTextEditor.ControlsGroup>

                  <Divider orientation="vertical" className="mx-0" />

                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Bold />
                    <RichTextEditor.Italic />
                    <RichTextEditor.Underline />
                    <RichTextEditor.Strikethrough />
                  </RichTextEditor.ControlsGroup>

                  <Divider orientation="vertical" className="mx-0" />

                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Link />
                    <RichTextEditor.Unlink />
                    <HardBreakControl />
                  </RichTextEditor.ControlsGroup>

                  <Divider orientation="vertical" className="mx-0" />

                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Code />
                    <RichTextEditor.BulletList />
                    <RichTextEditor.OrderedList />
                  </RichTextEditor.ControlsGroup>

                  <Divider orientation="vertical" className="mx-0" />

                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.ClearFormatting />
                  </RichTextEditor.ControlsGroup>
                </RichTextEditor.Toolbar>
                <RichTextEditor.Content />
              </RichTextEditor>
            )
          }}
        />
      </Input.Wrapper>
    )
  }
}

function HardBreakControl() {
  const { editor } = useRichTextEditorContext()
  return (
    <RichTextEditor.Control
      onClick={() => editor?.chain().focus().setHardBreak().run()}
      aria-label="Insert line break"
      title="Line break"
    >
      <Icon icon="tabler:corner-right-down-double" width={18} height={18} />
    </RichTextEditor.Control>
  )
}
