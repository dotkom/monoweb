import { MarkWriteSchema } from "@dotkomonline/types"
import { createDateTimeInput, createNumberInput, createTextInput, useFormBuilder } from "../../form"
import type { z } from "zod"

export const FormValidationSchema = MarkWriteSchema
type FormValidationSchema = z.infer<typeof FormValidationSchema>

interface UseMarkWriteFormProps {
  onSubmit(data: FormValidationSchema): void
  defaultValues?: Partial<FormValidationSchema>
  label?: string
}

export const useMarkWriteForm = ({ onSubmit, label = "Legg til ny prikk", defaultValues }: UseMarkWriteFormProps) =>
  useFormBuilder({
    schema: MarkWriteSchema,
    defaultValues,
    onSubmit,
    label,
    fields: {
      title: createTextInput({
        label: "Tittel",
        placeholder: "Tittel",
        withAsterisk: true,
      }),
      description: createTextInput({
        label: "Beskrivelse",
        placeholder: "Beskrivelse",
        withAsterisk: true,
      }),
      amount: createNumberInput({
        label: "Mengde",
        placeholder: "Mengde",
        withAsterisk: true,
        min: 1,
        max: 3,
      }),
      expiresAt: createDateTimeInput({
        label: "Utløpsdato",
        placeholder: "Utløpsdato",
        withAsterisk: true,
        minDate: new Date(),
      }),
    },
  })
