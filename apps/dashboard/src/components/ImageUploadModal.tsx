import { useFormBuilder } from "@/components/forms/Form"
import { createImageInput } from "@/components/forms/ImageInput"
import { createTextInput } from "@/components/forms/TextInput"
import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { z } from "zod"

const validationSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  alt: z.string().min(1).max(255),
  imageUrl: z.string().url(),
})

interface UploadImageModalProps {
  handleSubmit: (fileUrl: string, alt: string, title: string | undefined) => Promise<void>
  onFileUpload: (file: File) => Promise<string>
}

export const UploadImageModal: FC<ContextModalProps<UploadImageModalProps>> = ({ context, innerProps }) => {
  const Form = useFormBuilder({
    schema: validationSchema,
    defaultValues: {
      alt: "",
      title: "",
      imageUrl: "",
    },
    onSubmit: async (data) => {
      await innerProps.handleSubmit?.(data.imageUrl, data.alt, data.title || undefined)
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
      imageUrl: createImageInput({
        label: "Bilde",
        placeholder: "Last opp fil",
        onFileUpload: innerProps.onFileUpload,
      }),
    },
  })

  return <Form />
}

export const useUploadImageModal = (props: Partial<UploadImageModalProps>) => () => {
  if (!props.onFileUpload || !props.handleSubmit) {
    return
  }

  modals.openContextModal({
    modal: "image/upload",
    title: "Last opp bilde",
    innerProps: props,
  })
}
