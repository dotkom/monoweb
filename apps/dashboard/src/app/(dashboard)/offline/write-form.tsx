import { type z } from "zod"
import { createDateTimeInput, createTextInput, useFormBuilder } from "src/app/form"
import { OfflineWriteSchema } from "../../../../../../packages/types/src/offline"

const OFFLINE_FORM_DEFAULT_VALUES: Partial<FormValidationSchema> = {}

interface UseOfflineWriteFormProps {
  onSubmit(data: FormValidationSchema): void
  defaultValues?: Partial<FormValidationSchema>
  label?: string
}

export const FormValidationSchema = OfflineWriteSchema
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
      file: createTextInput({
        label: "Fil",
        placeholder: "s3 link",
      }),
      image: createTextInput({
        label: "Bilde",
        placeholder: "s3 link",
      }),
    },
  })
