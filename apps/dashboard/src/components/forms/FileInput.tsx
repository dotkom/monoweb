import { Button, FileInput, type FileInputProps, Stack } from "@mantine/core"
import { IconX } from "@tabler/icons-react"
import { Controller, type FieldValues } from "react-hook-form"
import type { InputProducerResult } from "./types"

export function createFileInput<F extends FieldValues>(
  props: Omit<FileInputProps, "error"> & {
    onFileUpload: (file: File) => Promise<string>
    existingFileUrl?: string
    maxSizeKiB?: number
  }
): InputProducerResult<F> {
  const { onFileUpload, existingFileUrl, maxSizeKiB, ...fileInputProps } = props

  const maxSizeDescription = maxSizeKiB ? `Maks filstørrelse er ${maxSizeKiB / 1024} MiB` : undefined

  const description = (
    <>
      {fileInputProps.description}
      {maxSizeDescription && <> ({maxSizeDescription})</>}
    </>
  )

  return function FormFileInput({ name, control, setError, clearErrors }) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <Stack gap="0.25rem">
            <FileInput
              {...fileInputProps}
              description={description}
              error={fieldState.error?.message}
              placeholder={field.value ?? existingFileUrl ?? "Klikk for å velge fil"}
              onChange={async (file) => {
                if (file === null) {
                  return
                }

                if (maxSizeKiB && file.size > maxSizeKiB * 1024) {
                  setError(name, {
                    type: "manual",
                    message: `Filen er for stor. ${maxSizeDescription}.`,
                  })
                  return
                }

                clearErrors(name)

                const result = await onFileUpload(file)
                field.onChange(result)
              }}
            />
            {props.required !== true && (
              <Button
                w="fit-content"
                color="gray"
                size="compact-xs"
                variant="subtle"
                onClick={() => field.onChange(null)}
                leftSection={<IconX size="0.85rem" />}
                styles={{ section: { marginRight: "0.35rem" } }}
              >
                Fjern fil
              </Button>
            )}
          </Stack>
        )}
      />
    )
  }
}
