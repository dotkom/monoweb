import { Button, FileInput, type FileInputProps, Group, Image, Stack, TextInput } from "@mantine/core"
import { IconX } from "@tabler/icons-react"
import { Controller, type FieldValues } from "react-hook-form"
import type { InputProducerResult } from "./types"

export function createImageInput<F extends FieldValues>({
  ...props
}: Omit<FileInputProps, "error"> & {
  onFileUpload: (file: File) => Promise<string>
  existingImageUrl?: string
  acceptGif?: boolean
}): InputProducerResult<F> {
  const { onFileUpload, existingImageUrl, acceptGif, ...fileInputProps } = props

  return function FormImageInput({ name, control }) {
    let accept = "image/png,image/jpeg,image/jpg"

    if (acceptGif) {
      accept += ",image/gif"
    }

    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <>
            <Stack gap="0.5rem">
              <Group gap="xs">
                <FileInput
                  {...fileInputProps}
                  accept={accept}
                  placeholder={field.value || existingImageUrl || "Klikk for å velge fil"}
                  onChange={async (file) => {
                    if (file === null) {
                      return
                    }
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
