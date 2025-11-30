import { createFileInput } from "@/components/forms/FileInput"
import { useFormBuilder } from "@/components/forms/Form"
import { createTextInput } from "@/components/forms/TextInput"
import { type ContextModalProps, modals } from "@mantine/modals"
import { RichTextEditor } from "@mantine/tiptap"
import { IconPhotoPlus } from "@tabler/icons-react"
import type { FC } from "react"
import { z } from "zod"

const validationSchema = z
  .object({
    title: z.string().min(1).max(255).optional(),
    alt: z.string().min(1).max(255),
    url: z.string().url().optional(),
    file: z.string().url().optional(),
  })
  .refine((data) => Boolean(data.url) || Boolean(data.file), { message: "Either URL or a file must be provided" })

interface ImageInputButtonProps {
  onClick?: () => void
}

export function ImageInputButton({ onClick }: ImageInputButtonProps) {
  return (
    <RichTextEditor.Control onClick={onClick} aria-label="Insert image" title="Insert image">
      <IconPhotoPlus size={16} />
    </RichTextEditor.Control>
  )
}

interface ImageUploadModalProps {
  handleSubmit: (fileUrl: string, alt: string, title: string | undefined) => Promise<void>
}

export const ImageUploadModal: FC<ContextModalProps<ImageUploadModalProps>> = ({ context, innerProps }) => {
  const Form = useFormBuilder({
    schema: validationSchema,
    defaultValues: {
      alt: "",
      title: "",
      url: "",
      file: "",
    },
    onSubmit: async (data) => {
      const url = data.url || data.file
      if (!url) {
        console.log("No URL or file provided, not submitting")
        return
      }
      console.log("Submitting image upload with data:\n", JSON.stringify(data, null, 2))
      await innerProps.handleSubmit(url, data.alt, data.title || undefined)
      // context.closeAll()
    },
    label: "Last opp bilde",
    fields: {
      alt: createTextInput({
        label: "Alt-tekst",
        placeholder: "Bilde av ...",
        required: true,
      }),
      title: createTextInput({
        label: "Bildetittel",
        description: "Vises når man holder musepekeren over bildet.",
        placeholder: "Kart over ...",
      }),
      url: createTextInput({
        label: "Bildelenke",
        placeholder: "https://...",
      }),
      file: createFileInput({
        label: "Last opp bilde",
        placeholder: "Velg fil...",
      }),
    },
  })

  return <Form />
}

export const useImageUploadModal = (props: ImageUploadModalProps) => () => {
  modals.openContextModal({
    modal: "event/image/create",
    title: "Last opp bilde",
    innerProps: props,
  })
}
