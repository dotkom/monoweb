import { Button, FileInput, type FileInputProps, Stack } from "@mantine/core"
import { IconX } from "@tabler/icons-react"
import { Controller, type FieldValues } from "react-hook-form"
import type { InputProducerResult } from "./types"

export function createFileInput<F extends FieldValues>(
  props: Omit<FileInputProps, "error"> & {
    onFileUpload: (file: File) => Promise<string>
    existingFileUrl?: string
  }
): InputProducerResult<F> {
  const { onFileUpload, existingFileUrl, ...fileInputProps } = props

  return function FormFileInput({ name, control }) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Stack gap="0.5rem">
            <FileInput
              {...fileInputProps}
              placeholder={field.value ?? existingFileUrl ?? "Klikk for å velge fil"}
              onChange={async (file) => {
                if (file === null) {
                  return
                }
                const result = await onFileUpload(file)
                field.onChange(result)
              }}
            />
            <Button
              w="fit-content"
              color="gray"
              size="compact-xs"
              variant="subtle"
              onClick={() => field.onChange(null)}
              leftSection={<IconX size="1rem" />}
              styles={{ section: { marginRight: "0.35rem" } }}
            >
              Fjern fil
            </Button>
          </Stack>
        )}
      />
    )
  }
}
