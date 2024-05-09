import { ErrorMessage } from "@hookform/error-message"
import { Anchor, Box, type FileInputProps, Text } from "@mantine/core"
import type { ReactNode } from "react"
import { Controller, type FieldValues } from "react-hook-form"
import { z } from "zod"
import type { InputProducerResult } from "../../../app/form"
import { useS3UploadFile } from "../../../modules/offline/use-s3-upload-file"
import { buildAssetUrl } from "../../../utils/s3"
import { getImageDimensions } from "../ImageUpload/utils"
import { useDisableRefetchOnFocus } from "./utils"

export const AssetFormFileSchema = z.object({
  key: z.string(),
  originalFilename: z.string(),
  size: z.number(),
  mimeType: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
})
export type AssetFormFile = z.infer<typeof AssetFormFileSchema>

interface Props {
  onFileLoad: (file: AssetFormFile) => void
  value: AssetFormFile | null
  error?: ReactNode
  isImageType: boolean
}

export function FileUpload({ onFileLoad, value, error, isImageType }: Props) {
  useDisableRefetchOnFocus()
  const upload = useS3UploadFile()

  console.log("FileUpload", value)

  async function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    console.log("onSelectFile", e.target.files)
    if (e.target.files && e.target.files.length > 0) {
      let width = undefined
      let height = undefined

      if (isImageType) {
        try {
          const dimensions = await getImageDimensions(e.target.files[0])
          width = dimensions.width
          height = dimensions.height
        } catch (e) {
          console.error(e)
          // TODO: Should use something else than alert
          alert(
            "Greide ikke hente ut dimensjoner fra bildet. Send en melding i #support i Online-slacken! Ellers kan du se på feilmeldingen i konsollen for å se om du kan løse det selv."
          )
        }
      }

      const result = await upload(e.target.files[0])
      console.log("onSelectFile", result)
      onFileLoad({
        key: result.s3FileName,
        originalFilename: result.originalFilename,
        size: result.size,
        mimeType: result.mimeType,
        width,
        height,
      })
    }
  }

  return (
    <div className="App">
      <Box mb={"sm"}>
        <input type="file" onChange={onSelectFile} />
        {error && (
          <Text c="red" mt="sm">
            {error}
          </Text>
        )}
      </Box>
      {!!value && (
        <Anchor href={buildAssetUrl(value.key)} target="_blank">
          {value.originalFilename}
        </Anchor>
      )}
    </div>
  )
}

export function createAssetFormFileInput<F extends FieldValues>({
  ...props
}: FileInputProps & {
  isImageType: boolean
}): InputProducerResult<F> {
  return function FormFileInput({ name, state, control }) {
    return (
      <Box>
        <Text>{props.label}</Text>
        {state.errors[name] && <ErrorMessage errors={state.errors} name={name} />}
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <FileUpload value={field.value} onFileLoad={field.onChange} isImageType={props.isImageType} />
          )}
        />
      </Box>
    )
  }
}
