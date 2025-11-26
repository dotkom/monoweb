import { RichTextEditor, useRichTextEditorContext } from "@mantine/tiptap"
import {
  IconColumnInsertRight,
  IconColumns1,
  IconColumns2,
  IconLayoutNavbarFilled,
  IconLayoutSidebarFilled,
  IconRowInsertBottom,
  IconTableColumn,
  IconTableOff,
  IconTablePlus,
  IconTableRow,
} from "@tabler/icons-react"

// Docs here:
// https://tiptap.dev/docs/editor/extensions/nodes/table

export function InsertTableControl() {
  const { editor } = useRichTextEditorContext()
  return (
    <RichTextEditor.Control
      onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 2, withHeaderRow: true }).run()}
      aria-label="Insert table"
      title="Insert table"
    >
      <IconTablePlus size={16} />
    </RichTextEditor.Control>
  )
}

export function AddColumnAfter() {
  const { editor } = useRichTextEditorContext()
  return (
    <RichTextEditor.Control
      onClick={() => editor?.chain().focus().addColumnAfter().run()}
      aria-label="Add column after"
      title="Add column after"
    >
      <IconColumnInsertRight size={16} />
    </RichTextEditor.Control>
  )
}

export function AddRowAfter() {
  const { editor } = useRichTextEditorContext()
  return (
    <RichTextEditor.Control
      onClick={() => editor?.chain().focus().addRowAfter().run()}
      aria-label="Add row after"
      title="Add row after"
    >
      <IconRowInsertBottom size={16} />
    </RichTextEditor.Control>
  )
}

export function DeleteColumn() {
  const { editor } = useRichTextEditorContext()
  return (
    <RichTextEditor.Control
      onClick={() => editor?.chain().focus().deleteColumn().run()}
      aria-label="Delete column"
      title="Delete column"
    >
      <IconTableColumn size={16} />
    </RichTextEditor.Control>
  )
}

export function DeleteRow() {
  const { editor } = useRichTextEditorContext()
  return (
    <RichTextEditor.Control
      onClick={() => editor?.chain().focus().deleteRow().run()}
      aria-label="Delete row"
      title="Delete row"
    >
      <IconTableRow size={16} />
    </RichTextEditor.Control>
  )
}

export function ToggleHeaderRow() {
  const { editor } = useRichTextEditorContext()
  return (
    <RichTextEditor.Control
      onClick={() => editor?.chain().focus().toggleHeaderRow().run()}
      aria-label="Toogle header row"
      title="Toogle header row"
    >
      <IconLayoutNavbarFilled size={16} />
    </RichTextEditor.Control>
  )
}

export function ToggleHeaderColumn() {
  const { editor } = useRichTextEditorContext()
  return (
    <RichTextEditor.Control
      onClick={() => editor?.chain().focus().toggleHeaderColumn().run()}
      aria-label="Toogle header column"
      title="Toogle header column"
    >
      <IconLayoutSidebarFilled size={16} />
    </RichTextEditor.Control>
  )
}

export function SplitCell() {
  const { editor } = useRichTextEditorContext()
  return (
    <RichTextEditor.Control
      onClick={() => editor?.chain().focus().splitCell().run()}
      aria-label="Split cells"
      title="Split cells"
    >
      <IconColumns2 size={16} />
    </RichTextEditor.Control>
  )
}

export function MergeCells() {
  const { editor } = useRichTextEditorContext()
  return (
    <RichTextEditor.Control
      onClick={() => editor?.chain().focus().mergeCells().run()}
      aria-label="Merge cells"
      title="Merge cells (select multiple cells)"
    >
      <IconColumns1 size={16} />
    </RichTextEditor.Control>
  )
}

export function DeleteTable() {
  const { editor } = useRichTextEditorContext()
  return (
    <RichTextEditor.Control
      onClick={() => editor?.chain().focus().deleteTable().run()}
      aria-label="Delete table"
      title="Delete table"
    >
      <IconTableOff size={16} />
    </RichTextEditor.Control>
  )
}
