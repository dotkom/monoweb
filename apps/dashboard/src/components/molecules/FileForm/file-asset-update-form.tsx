import { z } from "zod"
import { createMultipleSelectInput, createTextInput, useFormBuilder } from "../../../app/form"

interface Props {
  onSubmit: (values: Schema) => void
  defaultValues: Schema
}

const schema = z.object({
  title: z.string(),
  tags: z.array(z.string()),
})
type Schema = z.infer<typeof schema>

export function useFileAssetUpdateForm({ onSubmit, defaultValues }: Props) {
  return useFormBuilder({
    label: "Endre data knyttet til fil",
    defaultValues,
    onSubmit,
    schema,
    fields: {
      title: createTextInput({
        label: "Tittel",
        placeholder: "Tittel",
        required: true,
      }),
      tags: createMultipleSelectInput({
        label: "Tags",
        placeholder: "Tags",
        required: false,
      }),
    },
  })
}
