import { createDateTimeInput } from "@/components/forms/DateTimeInput"
import { createFileInput } from "@/components/forms/FileInput"
import { useFormBuilder } from "@/components/forms/Form"
import { createTextInput } from "@/components/forms/TextInput"
import { OfflineWriteSchema } from "@dotkomonline/types"
import type { z } from "zod"

export const FormValidationSchema = OfflineWriteSchema
type FormValidationSchema = z.infer<typeof FormValidationSchema>

interface UseOfflineWriteFormProps {
  onSubmit(data: FormValidationSchema): Promise<void>
  defaultValues?: Partial<FormValidationSchema>
  label?: string
}

export const useOfflineWriteForm = ({ onSubmit, label = "Registrer", defaultValues }: UseOfflineWriteFormProps) =>
  useFormBuilder({
    schema: FormValidationSchema,
    defaultValues,
    onSubmit,
    label,
    fields: {
      title: createTextInput({
        label: "Tittel",
        placeholder: "Offline #50",
        required: true,
      }),
      publishedAt: createDateTimeInput({
        label: "Utgivelsesdato",
        placeholder: "2023-10-05",
      }),
      fileUrl: createFileInput({
        label: "Fil",
        placeholder: "Last opp",
        required: true,
      }),
      imageUrl: createFileInput({
        label: "Bilde",
        placeholder: "Last opp",
        required: true,
      }),
    },
  })
