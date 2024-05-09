import { ASSET_TAGS } from "@dotkomonline/types"
import { z } from "zod"
import { createMultipleSelectInput, createTextInput, createTextareaInput, useFormBuilder } from "../../../app/form"

interface Props {
  onSubmit: (values: Schema) => void
  defaultValues: Schema
}

const schema = z.object({
  title: z.string(),
  tags: z.array(z.string()),
  photographer: z.string(),
  altText: z.string(),
})
type Schema = z.infer<typeof schema>

export function useImageAssetUpdateForm({ onSubmit, defaultValues }: Props) {
  return useFormBuilder({
    label: "Oppdater data knyttet til bilde",
    onSubmit,
    defaultValues,
    schema: z.object({
      title: z.string(),
      tags: z.array(z.string()),
      photographer: z.string(),
      altText: z.string(),
    }),
    fields: {
      title: createTextInput({
        label: "Tittel",
        placeholder: "Tittel",
        required: true,
      }),
      photographer: createTextInput({
        label: "Fotograf",
        placeholder: "Fotograf",
        required: true,
      }),
      altText: createTextareaInput({
        label: "Alt-tekst",
        placeholder: "Alt-tekst",
        required: true,
      }),
      tags: createMultipleSelectInput({
        label: "Tags",
        placeholder: "Tags",
        required: false,
        data: ASSET_TAGS,
      }),
    },
  })
}
