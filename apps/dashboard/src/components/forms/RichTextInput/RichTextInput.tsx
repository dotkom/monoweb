"use client"

import { useUploadImageModal } from "@/components/ImageUploadModal"
import type { AspectRatio } from "@/components/forms/ImageInput"
import { InsertImageButton } from "@/components/forms/RichTextInput/InsertImageButton"
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
import { useEffect, useRef } from "react"
import { Controller, type FieldValues } from "react-hook-form"
import { getErrorMessage, type InputProducerResult } from "../types"
import "@mantine/tiptap/styles.css"
import "./tiptap-table-styling.css"
import "./tiptap-image-styling.css"

interface RichTextEditorFieldProps {
  disabled?: boolean
  value: string
  onChange: (value: string) => void
  onFileUpload?: (file: File) => Promise<string>
  maxFileSizeKiB?: number
  aspectRatio?: AspectRatio
  editorProps?: Omit<RichTextEditorProps, "error" | "children" | "editor">
}

export function RichTextInput({
  disabled,
  value,
  onChange,
  onFileUpload,
  maxFileSizeKiB,
  aspectRatio,
  editorProps = {},
}: RichTextEditorFieldProps) {
  const editorReference = useRef<Editor | null>(null)
  const imageInsertionSelectionReference = useRef<{ from: number; to: number } | null>(null)

  const openImageUploadModal = useUploadImageModal({
    onFileUpload,
    maxSizeKiB: maxFileSizeKiB,
    aspectRatio,
    handleSubmit: async (imageUrl, alt, title) => {
      const currentEditor = editorReference.current

      if (!currentEditor || currentEditor.isDestroyed) {
        return
      }

      const commandChain = currentEditor.chain()
      const imageInsertionSelection = imageInsertionSelectionReference.current

      if (imageInsertionSelection) {
        commandChain.setTextSelection(imageInsertionSelection)
      }

      commandChain.setImage({ src: imageUrl, alt, title }).run()
      imageInsertionSelectionReference.current = null
    },
  })

  const editor = useEditor({
    editable: !disabled,
    extensions: [
      StarterKit,
      Underline,
      Link,
      TableKit.configure({
        table: {
          resizable: !disabled,
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        inline: false,
        resize: disabled
          ? { enabled: false }
          : {
              enabled: true,
              minWidth: 25,
              minHeight: 25,
              alwaysPreserveAspectRatio: true,
            },
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: (update) => onChange(update.editor.getHTML()),
  })

  useEffect(() => {
    editor?.setEditable(!disabled)
  }, [disabled, editor])

  editorReference.current = editor

  const handleOpenImageUploadModal = () => {
    const currentEditor = editorReference.current

    if (!currentEditor || currentEditor.isDestroyed) {
      return
    }

    const { from, to } = currentEditor.state.selection
    imageInsertionSelectionReference.current = { from, to }

    openImageUploadModal()
  }

  return (
    <RichTextEditor {...editorProps} editor={editor} variant="subtle">
      {!disabled && (
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

          {Boolean(onFileUpload) && (
            <>
              <Divider orientation="vertical" className="mx-0" />

              <RichTextEditor.ControlsGroup>
                <InsertImageButton onClick={handleOpenImageUploadModal} />
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
      )}
      <RichTextEditor.Content />
    </RichTextEditor>
  )
}

export function createRichTextInput<F extends FieldValues, TTransformedValues extends FieldValues | undefined = F>({
  onChange,
  required,
  label,
  onFileUpload,
  maxFileSizeKiB,
  aspectRatio,
  ...props
}: Omit<RichTextEditorProps, "error" | "children" | "editor"> & {
  required: boolean
  label: string
  onFileUpload?: (file: File) => Promise<string>
  maxFileSizeKiB?: number
  aspectRatio?: AspectRatio
}): InputProducerResult<F, TTransformedValues> {
  return function FormRichTextInput({ name, state, control, disabled }) {
    return (
      <Input.Wrapper error={getErrorMessage(state, name)}>
        <Input.Label required={required}>{label}</Input.Label>
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <RichTextInput
              disabled={disabled}
              value={field.value}
              onChange={field.onChange}
              onFileUpload={onFileUpload}
              maxFileSizeKiB={maxFileSizeKiB}
              aspectRatio={aspectRatio}
              editorProps={props}
            />
          )}
        />
      </Input.Wrapper>
    )
  }
}
