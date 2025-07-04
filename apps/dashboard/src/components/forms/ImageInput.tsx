import { FileInput, type FileInputProps, Image } from "@mantine/core"
import { Controller, type FieldValues } from "react-hook-form"

import { useS3UploadFile } from "@/app/offline/use-s3-upload-file"
import type { InputProducerResult } from "./types"

export function createImageInput<F extends FieldValues>({
  ...props
}: Omit<FileInputProps, "error"> & {
  existingImageUrl?: string
}): InputProducerResult<F> {
  return function FormImageInput({ name, control }) {
    const upload = useS3UploadFile()
    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <>
            <FileInput
              {...props}
              accept="image/png,image/jpeg,image/jpg"
              placeholder={field.value ?? props.existingImageUrl ?? "Klikk for å velge fil"}
              onChange={async (file) => {
                if (file === null) {
                  return
                }
                const result = await upload(file)
                field.onChange(result)
              }}
            />
            {(field.value ?? props.existingImageUrl) && (
              <Image radius="sm" src={field.value ?? props.existingImageUrl} />
            )}
          </>
        )}
      />
    )
  }
}
