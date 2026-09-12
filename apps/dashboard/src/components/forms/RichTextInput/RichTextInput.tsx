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
import { type RefObject, useCallback, useEffect, useRef } from "react"
import { Controller, type FieldValues } from "react-hook-form"
import { getErrorMessage, type InputProducerResult } from "../types"
import "@mantine/tiptap/styles.css"
import "./tiptap-table-styling.css"
import "./tiptap-image-styling.css"

// The public event page is 80rem wide with 3rem side padding, and its description uses 60% of the content width.
const DEFAULT_IMAGE_WIDTH_IN_PIXELS = 710

interface RichTextEditorFieldProps {
  disabled?: boolean
  value: string
  onChange: (value: string) => void
  editorProps: Omit<RichTextEditorProps, "error" | "children" | "editor">
  editorReference: RefObject<Editor | null>
  imageInsertionSelectionReference: RefObject<{ from: number; to: number } | null>
  openImageUploadModal: () => void
  hasImageUpload: boolean
}

function RichTextEditorField({
  disabled,
  value,
  onChange,
  editorProps,
  editorReference,
  imageInsertionSelectionReference,
  openImageUploadModal,
  hasImageUpload,
}: RichTextEditorFieldProps) {
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
    onSelectionUpdate: ({ editor: currentEditor }) => {
      const { from, to } = currentEditor.state.selection

      imageInsertionSelectionReference.current = { from, to }
    },
  })

  useEffect(() => {
    editor?.setEditable(!disabled)
  }, [disabled, editor])

  editorReference.current = editor

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

          {hasImageUpload && (
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
      )}
      <RichTextEditor.Content />
    </RichTextEditor>
  )
}

export function useRichTextInput<F extends FieldValues, TTransformedValues extends FieldValues | undefined = F>({
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
  // The upload mutation can replace the generated field while its modal remains open. These references belong to
  // the form hook so the modal callback always reaches the current editor and retains the pre-upload selection.
  const editorReference = useRef<Editor | null>(null)
  const imageInsertionSelectionReference = useRef<{ from: number; to: number } | null>(null)

  const openImageUploadModal = useUploadImageModal({
    onFileUpload,
    maxSizeKiB: maxFileSizeKiB,
    aspectRatio,
    handleSubmit: async (imageUrl, alternativeText, title) => {
      const currentEditor = editorReference.current

      if (!currentEditor || currentEditor.isDestroyed) {
        return
      }

      const commandChain = currentEditor.chain()
      const imageInsertionSelection = imageInsertionSelectionReference.current

      if (imageInsertionSelection) {
        commandChain.setTextSelection(imageInsertionSelection)
      }

      commandChain
        .focus()
        .setImage({
          src: imageUrl,
          alt: alternativeText,
          title,
          width: DEFAULT_IMAGE_WIDTH_IN_PIXELS,
        })
        .run()
      imageInsertionSelectionReference.current = null
    },
  })

  const fieldConfigurationReference = useRef({
    editorProps: props,
    hasImageUpload: Boolean(onFileUpload),
    label,
    openImageUploadModal,
    required,
  })

  fieldConfigurationReference.current = {
    editorProps: props,
    hasImageUpload: Boolean(onFileUpload),
    label,
    openImageUploadModal,
    required,
  }

  return useCallback(function RichTextInput({ name, state, control, disabled }) {
    const fieldConfiguration = fieldConfigurationReference.current

    return (
      <Input.Wrapper error={getErrorMessage(state, name)}>
        <Input.Label required={fieldConfiguration.required}>{fieldConfiguration.label}</Input.Label>
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <RichTextEditorField
              disabled={disabled}
              value={field.value}
              onChange={field.onChange}
              editorProps={fieldConfiguration.editorProps}
              editorReference={editorReference}
              imageInsertionSelectionReference={imageInsertionSelectionReference}
              openImageUploadModal={fieldConfiguration.openImageUploadModal}
              hasImageUpload={fieldConfiguration.hasImageUpload}
            />
          )}
        />
      </Input.Wrapper>
    )
  }, [])
}
