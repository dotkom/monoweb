import { createEventSelectInput } from "@/components/forms/EventSelectInput"
import { useFormBuilder } from "@/components/forms/Form"
import { createNumberInput } from "@/components/forms/NumberInput"
import { FadderukeWriteSchema } from "@dotkomonline/rpc/fadderuke"
import { z } from "zod"

const FormValidationSchema = FadderukeWriteSchema.extend({
  eventId: z.string().min(1, "Velg et hovedarrangement"),
})

type FormValidationResult = z.infer<typeof FormValidationSchema>

interface UseFadderukeWriteFormProps {
  onSubmit(data: FormValidationResult): void
  defaultValues?: Partial<FormValidationResult>
  label?: string
}

export const useFadderukeWriteForm = ({
  onSubmit,
  defaultValues,
  label = "Opprett fadderuke",
}: UseFadderukeWriteFormProps) => {
  return useFormBuilder({
    schema: FormValidationSchema,
    defaultValues: {
      year: new Date().getFullYear(),
      eventId: "",
      ...defaultValues,
    },
    onSubmit,
    label,
    fields: {
      year: createNumberInput({
        label: "År",
        placeholder: "2026",
        withAsterisk: true,
      }),
      eventId: createEventSelectInput({
        label: "Hovedarrangement",
        placeholder: "Søk etter arrangement...",
        description: "Underarrangementer vises i tidslinjen på fadderukesiden.",
        withAsterisk: true,
        excludeChildEvents: true,
      }),
    },
  })
}
