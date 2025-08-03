import { createCheckboxInput } from "@/components/forms/CheckboxInput"
import { createFileInput } from "@/components/forms/FileInput"
import { useFormBuilder } from "@/components/forms/Form"
import { createSelectInput } from "@/components/forms/SelectInput"
import { createTextInput } from "@/components/forms/TextInput"
import { createTextareaInput } from "@/components/forms/TextareaInput"
import { GroupTypeSchema, type GroupWrite, GroupWriteSchema, getGroupTypeName } from "@dotkomonline/types"
import { getCurrentUtc } from "@dotkomonline/utils"
import z from "zod"

const FormSchema = GroupWriteSchema.omit({
  deactivatedAt: true,
}).extend({
  isActive: z.boolean(),
})

type FormResult = z.infer<typeof FormSchema>

const DEFAULT_VALUES: Partial<FormResult> = {
  imageUrl: null,
}

interface UseGroupWriteFormProps {
  onSubmit(data: GroupWrite): void
  defaultValues?: Partial<GroupWrite>
  label?: string
}

export const useGroupWriteForm = ({
  onSubmit,
  label = "Lag ny gruppe",
  defaultValues = DEFAULT_VALUES,
}: UseGroupWriteFormProps) =>
  useFormBuilder({
    schema: FormSchema,
    defaultValues,
    onSubmit: (data) => {
      const deactivatedAt = data.isActive ? null : getCurrentUtc()

      onSubmit({
        ...data,
        deactivatedAt,
      })
    },
    label,
    fields: {
      name: createTextInput({
        label: "Navn",
        placeholder: "Drifts- og utviklingskomiteen",
      }),
      abbreviation: createTextInput({
        label: "Kort navn",
        placeholder: "Dotkom",
        withAsterisk: true,
        required: true,
      }),
      about: createTextareaInput({
        label: "Om gruppen",
        withAsterisk: true,
        required: true,
        rows: 5,
      }),
      description: createTextareaInput({
        label: "Beskrivelse",
        withAsterisk: false,
        required: false,
        rows: 5,
      }),
      email: createTextInput({
        label: "Kontakt-e-post",
        type: "email",
      }),
      contactUrl: createTextInput({
        label: "Kontakt-lenke",
      }),
      imageUrl: createFileInput({
        label: "Bilde",
        placeholder: "Last opp",
      }),
      type: createSelectInput({
        label: "Type",
        placeholder: "Velg en",
        withAsterisk: true,
        required: true,
        data: Object.values(GroupTypeSchema.Values).map((groupType) => ({
          value: groupType,
          label: getGroupTypeName(groupType),
        })),
      }),
      isActive: createCheckboxInput({
        label: "Aktiv",
        defaultChecked: !defaultValues?.deactivatedAt,
      }),
    },
  })
