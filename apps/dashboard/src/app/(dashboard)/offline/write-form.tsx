import { ImageSchema, OfflineWriteSchema } from "@dotkomonline/types"
import type { z } from "zod"
import { createDateTimeInput, createFileInput, createImageInput, createTextInput, useFormBuilder } from "../../form"

const FormSchema = OfflineWriteSchema.omit({
  imageId: true,
}).extend({
  image: ImageSchema,
})
type FormSchema = z.infer<typeof FormSchema>

interface UseOfflineWriteFormProps {
  onSubmit(data: FormSchema): Promise<void>
  defaultValues?: Partial<FormSchema>
  label: string
}
export const useOfflineWriteForm = ({ onSubmit, label, defaultValues }: UseOfflineWriteFormProps) => {
  return useFormBuilder({
    schema: FormSchema,
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
      fileAssetKey: createFileInput({
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
