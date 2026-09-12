import { Button, FileInput, type FileInputProps, Group, Stack, Text } from "@mantine/core"
import { IconAlertCircle, IconX } from "@tabler/icons-react"
import { useState } from "react"
import { Controller, type FieldValues } from "react-hook-form"
import type { InputProducerResult } from "./types"

export function createFileInput<F extends FieldValues, TTransformedValues extends FieldValues | undefined = F>(
  props: Omit<FileInputProps, "error"> & {
    onFileUpload: (file: File) => Promise<string>
    existingFileUrl?: string
    maxSizeKiB?: number
    warnSizeKiB?: number
    warnSizeDescription?: string
  }
): InputProducerResult<F, TTransformedValues> {
  const { onFileUpload, existingFileUrl, maxSizeKiB, warnSizeKiB, warnSizeDescription, ...fileInputProps } = props

  const maxSizeDescription = maxSizeKiB ? `Maks filstørrelse er ${maxSizeKiB / 1024} MiB` : undefined

  const description = (
    <>
      {fileInputProps.description}
      {maxSizeDescription && <> ({maxSizeDescription})</>}
    </>
  )

  return function FormFileInput({ name, control, setError, clearErrors }) {
    const [showSizeWarning, setShowSizeWarning] = useState(false)

    const upload = async (file: File, field: FieldValues) => {
      clearErrors(name)
      const result = await onFileUpload(file)
      field.onChange(result)
    }

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

                if (warnSizeKiB !== undefined && file.size > warnSizeKiB * 1024) {
                  return setShowSizeWarning(true)
                }

                await upload(file, field)
              }}
            />
            {showSizeWarning && (
              <Stack>
                <Group gap="0.5rem" align="flex-start" wrap="nowrap">
                  <IconAlertCircle color="yellow" size="1rem" style={{ flexShrink: 0, marginTop: 2 }} />
                  <Text c="yellow" size="sm">
                    {warnSizeDescription ?? `Filen er over ${warnSizeKiB} KiB. Er du sikker på at du vil fortsette?`}
                  </Text>
                </Group>

                <Button
                  color="red"
                  variant="filled"
                  onClick={async () => {
                    setShowSizeWarning(false)
                    await upload(field.value, field)
                  }}
                >
                  Last opp likevel
                </Button>
              </Stack>
            )}
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
