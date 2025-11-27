"use client"

import {
  AddColumnAfter,
  AddRowAfter,
  DeleteColumn,
  DeleteRow,
  DeleteTable,
  InsertTableControl,
  MergeCells,
  SplitCell,
  ToggleHeaderColumn,
  ToggleHeaderRow,
} from "@/components/forms/RichTextInput/TableActionButtons"
import { ErrorMessage } from "@hookform/error-message"
import { Divider, Input } from "@mantine/core"
import { RichTextEditor, type RichTextEditorProps } from "@mantine/tiptap"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import { TableKit } from "@tiptap/extension-table"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import TableRow from "@tiptap/extension-table-row"
import Underline from "@tiptap/extension-underline"
import { type Editor, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Controller, type FieldValues } from "react-hook-form"
import type { InputProducerResult } from "../types"
import "@mantine/tiptap/styles.css"
import "./tiptap-table-styling.css"
import { useUploadImageModal } from "@/components/ImageUploadModal"
import { InsertImageButton } from "@/components/forms/RichTextInput/InsertImageButton"
import { useRef } from "react"

export function createRichTextInput<F extends FieldValues>({
  onChange,
  required,
  label,
  imageUploader,
  ...props
}: Omit<RichTextEditorProps, "error" | "children" | "editor"> & {
  required: boolean
  label: string
  imageUploader?: (file: File) => Promise<string>
}): InputProducerResult<F> {
  const editorRef = useRef<Editor | null>(null)

  const openImageUploadModal = useUploadImageModal({
    handleSubmit: async (imageUrl, alt, title) => {
      editorRef.current?.chain().focus().setImage({ src: imageUrl, alt, title }).run()
    },
    onFileUpload: imageUploader,
  })

  return function RichTextInput({ name, state, control }) {
    return (
      <Input.Wrapper error={state.errors[name] && <ErrorMessage errors={state.errors} name={name} />}>
        <Input.Label required={required}>{label}</Input.Label>
        <Controller
          control={control}
          name={name}
          render={({ field }) => {
            const editor = useEditor({
              extensions: [
                StarterKit,
                Underline,
                Link,
                TableKit.configure({
                  table: {
                    resizable: true,
                  },
                }),
                TableRow,
                TableHeader,
                TableCell,
                Image.configure({
                  inline: false,
                  resize: {
                    enabled: true,
                    minWidth: 50,
                    minHeight: 50,
                    alwaysPreserveAspectRatio: true,
                  },
                }),
              ],
              content: field.value,
              immediatelyRender: false,
              onUpdate: (value) => field.onChange(value.editor.getHTML()),
            })

            editorRef.current = editor

            return (
              <RichTextEditor {...props} editor={editor} variant="subtle">
                <RichTextEditor.Toolbar sticky stickyOffset={60}>
                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Undo />
                    <RichTextEditor.Redo />
                    <RichTextEditor.ClearFormatting />
                  </RichTextEditor.ControlsGroup>
                  <Divider orientation="vertical" className="mx-0" />
                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Bold />
                    <RichTextEditor.Italic />
                    <RichTextEditor.Underline />
                    <RichTextEditor.Strikethrough />
                    <RichTextEditor.CodeBlock />
                    <RichTextEditor.Link />
                    <RichTextEditor.Unlink />
                  </RichTextEditor.ControlsGroup>
                  <Divider orientation="vertical" className="mx-0" />
                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.H2 />
                    <RichTextEditor.H3 />
                    <RichTextEditor.H4 />
                    <RichTextEditor.BulletList />
                    <RichTextEditor.OrderedList />
                    <RichTextEditor.Hr />
                  </RichTextEditor.ControlsGroup>
                  {Boolean(imageUploader) && (
                    <>
                      <Divider orientation="vertical" className="mx-0" />
                      <RichTextEditor.ControlsGroup>
                        <InsertImageButton onClick={openImageUploadModal} />
                      </RichTextEditor.ControlsGroup>
                    </>
                  )}
                  <Divider orientation="vertical" className="mx-0" />
                  <RichTextEditor.ControlsGroup>
                    <InsertTableControl />
                    <AddColumnAfter />
                    <AddRowAfter />
                    <DeleteColumn />
                    <DeleteRow />
                    <SplitCell />
                    <MergeCells />
                    <ToggleHeaderRow />
                    <ToggleHeaderColumn />
                    <DeleteTable />
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
