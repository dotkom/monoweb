import { ASSET_TAGS } from "@dotkomonline/types"
import { z } from "zod"
import { createMultipleSelectInput, createTextInput, useFormBuilder } from "../../../app/form"
import { AssetFormFileSchema, createAssetFormFileInput } from "./FileUpload"

interface Props {
  onSubmit: (values: Schema) => void
}

const schema = z.object({
  file: AssetFormFileSchema,
  title: z.string(),
  tags: z.array(z.string()),
})
type Schema = z.infer<typeof schema>

export function useFileAssetCreateForm({ onSubmit }: Props) {
  return useFormBuilder({
    label: "Last opp ny fil",
    onSubmit,
    schema,
    fields: {
      file: createAssetFormFileInput({
        label: "Fil",
        placeholder: "Last opp",
        required: true,
        isImageType: false,
      }),
      title: createTextInput({
        label: "Tittel",
        placeholder: "Tittel",
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
