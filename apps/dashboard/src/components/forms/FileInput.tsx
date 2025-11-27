import { FileInput, type FileInputProps } from "@mantine/core"
import { Controller, type FieldValues } from "react-hook-form"
import type { InputProducerResult } from "./types"

export function createFileInput<F extends FieldValues>(
  props: Omit<FileInputProps, "error"> & {
    onFileUpload: (file: File) => Promise<string>
    existingFileUrl?: string
  }
): InputProducerResult<F> {
  return function FormFileInput({ name, control }) {
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
              const result = await props.onFileUpload(file)
              field.onChange(result)
            }}
          />
        )}
      />
    )
  }
}
