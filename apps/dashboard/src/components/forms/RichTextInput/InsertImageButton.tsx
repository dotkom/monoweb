import { RichTextEditor } from "@mantine/tiptap"
import { IconPhotoPlus } from "@tabler/icons-react"

interface ImageInputButtonProps {
  onClick?: () => void
}

export function InsertImageButton({ onClick }: ImageInputButtonProps) {
  return (
    <RichTextEditor.Control onClick={onClick} aria-label="Insert image" title="Insert image">
      <IconPhotoPlus size={16} />
    </RichTextEditor.Control>
  )
}
