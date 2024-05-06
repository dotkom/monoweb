import { ImageSchema, type Offline, OfflineWriteSchema } from "@dotkomonline/types"
import type { z } from "zod"
import { createDateTimeInput, createFileInput, createImageInput, createTextInput, useFormBuilder } from "../../form"

interface UseOfflineWriteFormProps {
  onSubmit(data: FormValidationSchema): Promise<void>
  defaultValues?: Partial<Offline>
  label?: string
}

export const FormValidationSchema = OfflineWriteSchema.omit({
  imageId: true,
}).extend({
  image: ImageSchema,
})
type FormValidationSchema = z.infer<typeof FormValidationSchema>

export const useOfflineWriteForm = ({ onSubmit, label = "Registrer", defaultValues }: UseOfflineWriteFormProps) => {
  return useFormBuilder({
    schema: FormValidationSchema,
    defaultValues,
    onSubmit,
    label,
    fields: {
      title: createTextInput({
        label: "Tittel",
        placeholder: "Offline #50",
      }),
      published: createDateTimeInput({
        label: "Utgivelsesdato",
        placeholder: "2023-10-05",
      }),
      fileId: createFileInput({
        label: "Fil",
        placeholder: "Last opp",
      }),
      image: createImageInput({
        label: "Bilde",
        placeholder: "Last opp",
      }),
    },
  })
}
