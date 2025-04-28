"use client"

import { Input } from "@mantine/core"
import { RichTextEditor, type RichTextEditorProps } from "@mantine/tiptap"
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
              extensions: [StarterKit, Underline],
              content: field.value,
              immediatelyRender: false,
              onUpdate: (value) => field.onChange(value.editor.getHTML()),
            })

            return (
              <RichTextEditor {...props} editor={editor} variant="subtle">
                <RichTextEditor.Toolbar sticky stickyOffset={60}>
                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Bold />
                    <RichTextEditor.Italic />
                    <RichTextEditor.Underline />
                    <RichTextEditor.Strikethrough />
                    <RichTextEditor.ClearFormatting />
                    <RichTextEditor.Highlight />
                    <RichTextEditor.Code />
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
