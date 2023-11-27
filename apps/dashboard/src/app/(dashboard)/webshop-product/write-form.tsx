import { WebshopProductWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { createNumberInput, createTextInput, useFormBuilder } from "../../form"

const ValidationScheam = WebshopProductWriteSchema.extend({
  images: z.string(),
})

type ValidationSchema = z.infer<typeof ValidationScheam>

const PRODUCT_FORM_DEFAULT_VALUES: Partial<ValidationSchema> = {}

interface UseWebshopProductWriteFormProps {
  onSubmit(data: ValidationSchema): void
  defaultValues?: Partial<ValidationSchema>
  label?: string
}

export const useWebshopProductWriteForm = ({
  onSubmit,
  label = "Opprett",
  defaultValues = PRODUCT_FORM_DEFAULT_VALUES,
}: UseWebshopProductWriteFormProps) =>
  useFormBuilder({
    schema: ValidationScheam,
    defaultValues,
    onSubmit,
    label,
    fields: {
      name: createTextInput({
        label: "Navn",
        placeholder: "Genser",
        withAsterisk: true,
      }),
      variantDescription: createTextInput({
        label: "Beskrivelse",
        placeholder: "Fin genser",
      }),
      price: createNumberInput({
        label: "Pris",
        placeholder: "999",
      }),
      images: createTextInput({
        label: "Bilde (komma-separert)",
        placeholder: "Åre",
        withAsterisk: true,
      }),
    },
  })
