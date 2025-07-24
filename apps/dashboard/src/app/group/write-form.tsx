import { createFileInput } from "@/components/forms/FileInput"
import { useFormBuilder } from "@/components/forms/Form"
import { createSelectInput } from "@/components/forms/SelectInput"
import { createTextInput } from "@/components/forms/TextInput"
import { createTextareaInput } from "@/components/forms/TextareaInput"
import { type GroupWrite, GroupWriteSchema } from "@dotkomonline/types"

const GROUP_FORM_DEFAULT_VALUES: Partial<GroupWrite> = {}

interface UseGroupWriteFormProps {
  onSubmit(data: GroupWrite): void
  defaultValues?: Partial<GroupWrite>
  label?: string
}

export const useGroupWriteForm = ({
  onSubmit,
  label = "Lag ny gruppe",
  defaultValues = GROUP_FORM_DEFAULT_VALUES,
}: UseGroupWriteFormProps) =>
  useFormBuilder({
    schema: GroupWriteSchema,
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
      shortDescription: createTextareaInput({
        label: "Kort beskrivelse",
        withAsterisk: false,
        required: false,
        rows: 5,
      }),
      email: createTextInput({
        label: "Kontakt-e-post",
        withAsterisk: true,
        type: "email",
        required: true,
      }),
      image: createFileInput({
        label: "Bilde",
        placeholder: "Last opp",
        required: true,
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
