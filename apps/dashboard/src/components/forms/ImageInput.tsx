import { Button, FileInput, Group, Image, Stack, TextInput, type FileInputProps } from "@mantine/core"
import { IconX } from "@tabler/icons-react"
import { Controller, type FieldValues } from "react-hook-form"
import type { InputProducerResult } from "./types"

export function createImageInput<F extends FieldValues>({
  ...props
}: Omit<FileInputProps, "error"> & {
  onFileUpload: (file: File) => Promise<string>
  existingImageUrl?: string
  acceptGif?: boolean
  maxSizeKiB?: number
}): InputProducerResult<F> {
  const { onFileUpload, existingImageUrl, acceptGif, maxSizeKiB, ...fileInputProps } = props

  return function FormImageInput({ name, control, setError, clearErrors }) {
    let accept = "image/png,image/jpeg,image/jpg"

    if (acceptGif) {
      accept += ",image/gif"
    }

    const maxSizeDescription = maxSizeKiB ? `Maks filstørrelse er ${maxSizeKiB / 1024} MiB` : undefined

    const description = (
      <>
        {fileInputProps.description}
        {maxSizeDescription && <> ({maxSizeDescription})</>}
      </>
    )

    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <>
            <Stack gap="0.5rem">
              <Group gap="xs">
                <FileInput
                  {...fileInputProps}
                  description={description}
                  accept={accept}
                  error={fieldState.error?.message}
                  placeholder={field.value || existingImageUrl || "Klikk for å velge fil"}
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
                  flex="1"
                />
                <TextInput
                  // Margin is eyeballed to align with the FileInput height
                  mt="1.5rem"
                  placeholder="Legg inn URL direkte"
                  onChange={async (event) => field.onChange(event.target.value)}
                  value={field.value ?? ""}
                  flex="1"
                />
              </Group>
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
            {(field.value || props.existingImageUrl) && (
              <Image src={field.value || props.existingImageUrl} radius="md" maw="max(20dvw, 32rem)" />
            )}
          </>
        )}
      />
    )
  }
}
