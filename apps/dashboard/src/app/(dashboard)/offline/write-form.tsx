import { z } from "zod"
import { createDateTimeInput, createFileInput, createTextInput, useFormBuilder } from "src/app/form"
import { OfflineWriteSchema } from "../../../../../../packages/types/src/offline"

const OFFLINE_FORM_DEFAULT_VALUES: Partial<FormValidationSchema> = {
  fileUrl: null,
  imageUrl: null,
}

interface UseOfflineWriteFormProps {
  onSubmit(data: FormValidationSchema): Promise<void>
  defaultValues?: Partial<FormValidationSchema>
  label?: string
}

export const FormValidationSchema = OfflineWriteSchema.extend({
  file: z.instanceof(File).optional(),
  image: z.instanceof(File).optional(),
  fileUrl: z.string().nullable(),
  imageUrl: z.string().nullable(),
})
type FormValidationSchema = z.infer<typeof FormValidationSchema>

export const useOfflineWriteForm = ({
  onSubmit,
  label = "Registrer",
  defaultValues = OFFLINE_FORM_DEFAULT_VALUES,
}: UseOfflineWriteFormProps) =>
  useFormBuilder({
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
      file: createFileInput({
        label: "Fil",
        placeholder: "Last opp",
        existingFileUrl: defaultValues.fileUrl ?? undefined,
      }),
      image: createFileInput({
        label: "Bilde",
        placeholder: "Last opp",
        existingFileUrl: defaultValues.imageUrl ?? undefined,
      }),
    },
  })
