import { type GroupWrite, GroupWriteSchema } from "@dotkomonline/types"
import { createFileInput, createSelectInput, createTextInput, createTextareaInput, useFormBuilder } from "../../form"

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
        label: "Kort beskrivelse",
        withAsterisk: true,
        required: true,
        rows: 5,
      }),
      longDescription: createTextareaInput({
        label: "Lang beskrivelse",
        withAsterisk: false,
        required: false,
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
