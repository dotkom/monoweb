import { FileInput, type FileInputProps } from "@mantine/core"
import { Controller, type FieldValues } from "react-hook-form"

import { useS3UploadFile } from "@/app/offline/use-s3-upload-file"
import type { InputProducerResult } from "./types"

export function createFileInput<F extends FieldValues>({
  ...props
}: Omit<FileInputProps, "error"> & {
  existingFileUrl?: string
}): InputProducerResult<F> {
  return function FormFileInput({ name, control }) {
    const upload = useS3UploadFile()
    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <FileInput
            {...props}
            placeholder={field.value ?? props.existingFileUrl ?? "Klikk for å velge fil"}
            onChange={async (file) => {
              if (file === null) {
                return
              }
              const result = await upload(file)
              field.onChange(result)
            }}
          />
        )}
      />
    )
  }
}
