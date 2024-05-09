import { z } from "zod"
import { createMultipleSelectInput, createTextareaInput, createTextInput, useFormBuilder } from "../../../app/form"
import { AssetFormFileSchema, createAssetFormFileInput } from "./FileUpload"
import { ASSET_TAGS } from "@dotkomonline/types"

interface Props {
  onSubmit: (values: Schema) => void
}

const schema = z.object({
  file: AssetFormFileSchema.required(),
  title: z.string(),
  tags: z.array(z.string()),
  photographer: z.string(),
  altText: z.string(),
})
type Schema = z.infer<typeof schema>

export function useImageAssetCreateForm({ onSubmit }: Props) {
  return useFormBuilder({
    label: "Last opp nytt bilde",
    onSubmit,
    schema: z.object({
      file: AssetFormFileSchema.required(),
      title: z.string(),
      tags: z.array(z.string()),
      photographer: z.string(),
      altText: z.string(),
    }),
    fields: {
      file: createAssetFormFileInput({
        label: "Fil",
        placeholder: "Last opp",
        required: true,
        isImageType: true,
      }),
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
        data: ASSET_TAGS
      }),
    },
  })
}
