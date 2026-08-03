import { useFormBuilder } from "@/components/forms/Form"
import { type AspectRatio, createImageInput } from "@/components/forms/ImageInput"
import { createTextInput } from "@/components/forms/TextInput"
import { Stack, Text } from "@mantine/core"
import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { z } from "zod"

const metadataValidationSchema = z.object({
  title: z.string().max(255).optional(),
  alt: z.string().min(1).max(255),
  imageUrl: z.url(),
})

const imageOnlyValidationSchema = z.object({
  imageUrl: z.url(),
})

interface UploadImageModalProps {
  handleSubmit: (fileUrl: string, alt: string, title: string | undefined) => Promise<void>
  onFileUpload: (file: File) => Promise<string>
  maxSizeKiB?: number
  aspectRatio?: AspectRatio
  acceptGif?: boolean
  withMetadata?: boolean
}

export const UploadImageModal: FC<ContextModalProps<UploadImageModalProps>> = ({ context, innerProps }) => {
  const withMetadata = innerProps.withMetadata !== false

  if (!withMetadata) {
    return <ImageOnlyUploadForm context={context} innerProps={innerProps} />
  }

  return <MetadataUploadForm context={context} innerProps={innerProps} />
}

const MetadataUploadForm: FC<Pick<ContextModalProps<UploadImageModalProps>, "context" | "innerProps">> = ({
  context,
  innerProps,
}) => {
  const Form = useFormBuilder({
    schema: metadataValidationSchema,
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
        maxSizeKiB: innerProps.maxSizeKiB,
        aspectRatio: innerProps.aspectRatio,
        acceptGif: innerProps.acceptGif,
      }),
      alt: createTextInput({
        label: "Alt-tekst",
        description: "Vises dersom bildet ikke kan lastes inn, og brukes av skjermlesere.",
        placeholder: "Hytteoversikt for Åre",
        required: true,
      }),
      title: createTextInput({
        label: "Bildetittel",
        description: "Vises når man holder musepekeren over bildet.",
        placeholder: "Hytteoversikt for Åre",
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

const ImageOnlyUploadForm: FC<Pick<ContextModalProps<UploadImageModalProps>, "context" | "innerProps">> = ({
  context,
  innerProps,
}) => {
  const Form = useFormBuilder({
    schema: imageOnlyValidationSchema,
    onSubmit: async (data) => {
      await innerProps.handleSubmit?.(data.imageUrl, "", undefined)
      context.closeAll()
    },
    label: "Lagre",
    fields: {
      imageUrl: createImageInput({
        label: "Bilde",
        placeholder: "Last opp fil",
        onFileUpload: innerProps.onFileUpload,
        maxSizeKiB: innerProps.maxSizeKiB,
        aspectRatio: innerProps.aspectRatio,
        acceptGif: innerProps.acceptGif,
      }),
    },
  })

  return (
    <Stack>
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
    size: "lg",
    innerProps: props,
  })
}
