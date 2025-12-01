import { useFormBuilder } from "@/components/forms/Form"
import { createImageInput } from "@/components/forms/ImageInput"
import { createTextInput } from "@/components/forms/TextInput"
import { Stack, Text } from "@mantine/core"
import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { z } from "zod"

const validationSchema = z.object({
  title: z.string().max(255).optional(),
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
    onSubmit: async (data) => {
      await innerProps.handleSubmit?.(data.imageUrl, data.alt, data.title || undefined)
      context.closeAll()
    },
    label: "Last opp bilde",
    fields: {
      imageUrl: createImageInput({
        label: "Bilde",
        placeholder: "Last opp fil",
        onFileUpload: innerProps.onFileUpload,
      }),
      alt: createTextInput({
        label: "Alt-tekst",
        description: "Vises dersom bildet ikke kan lastes inn, og brukes av skjermlesere.",
        placeholder: "Bilde av ...",
        required: true,
      }),
      title: createTextInput({
        label: "Bildetittel",
        description: "Vises når man holder musepekeren over bildet.",
        placeholder: "Kart over ...",
      }),
    },
  })

  return (
    <Stack>
      <Text size="sm">Dersom bildet blir plassert feil, kan du holde-og-dra bildet dit du ønsker det</Text>
      <Form />
    </Stack>
  )
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
