import { createTextInput, useFormBuilder } from "../../form"
import { MarkWrite, MarkWriteSchema } from "@dotkomonline/types"

const MARK_FORM_DEFAULT_VALUES: Partial<MarkWrite> = {
  title: undefined,
  details: undefined,
  duration: undefined,
}

type UseMarkWriteFormProps = {
  onSubmit: (data: MarkWrite) => void
  defaultValues?: Partial<MarkWrite>
  label?: string
}

export const useMarkWriteForm = ({
  onSubmit,
  label = "Edit Mark",
  defaultValues = MARK_FORM_DEFAULT_VALUES,
}: UseMarkWriteFormProps) => {
  return useFormBuilder({
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
      details: createTextInput({
        label: "Beskrivelse",
        placeholder: "Beskrivelse",
        withAsterisk: true,
      }),
      duration: createTextInput({
        label: "Varighet",
        placeholder: "Varighet",
        withAsterisk: true,
      }),
    },
  })
}
