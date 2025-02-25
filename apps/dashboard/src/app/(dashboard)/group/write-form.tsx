import { GroupWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { createFileInput, createSelectInput, createTextInput, createTextareaInput, useFormBuilder } from "../../form"

const GROUP_FORM_DEFAULT_VALUES: Partial<FormValidationSchema> = {
  imageUrl: null,
  image: null,
}

interface UseGroupWriteFormProps {
  onSubmit(data: FormValidationSchema): Promise<void>
  defaultValues?: Partial<FormValidationSchema>
  label?: string
}

export const FormValidationSchema = GroupWriteSchema.extend({
  imageUrl: z.string().nullable(),
  image: z.any().optional(),
})
type FormValidationSchema = z.infer<typeof FormValidationSchema>

export const useGroupWriteForm = ({
  onSubmit,
  label = "Lag ny gruppe",
  defaultValues = GROUP_FORM_DEFAULT_VALUES,
}: UseGroupWriteFormProps) =>
  useFormBuilder({
    schema: FormValidationSchema,
    defaultValues: defaultValues,
    onSubmit,
    label,
    fields: {
      name: createTextInput({
        label: "Navn",
        placeholder: "Gruppe",
        withAsterisk: true,
        required: true,
      }),
      description: createTextareaInput({
        label: "Beskrivelse",
        withAsterisk: true,
        required: true,
        rows: 5,
      }),
      email: createTextInput({
        label: "Kontakt-e-post",
        withAsterisk: true,
        required: true,
      }),
      image: createFileInput({
        label: "Bilde",
        placeholder: "Last opp",
        existingfileurl: defaultValues.imageUrl ?? undefined,
        withAsterisk: false,
      }),
      type: createSelectInput({
        label: "Type",
        placeholder: "Velg en",
        withAsterisk: true,
        required: true,
        data: [
          { value: "COMMITTEE", label: "Komité" },
          { value: "NODECOMMITTEE", label: "Nodekomité" },
          { value: "OTHERGROUP", label: "Annen gruppe" },
        ],
      }),
    },
  })
