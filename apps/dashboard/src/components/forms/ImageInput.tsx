import { Button, FileInput, type FileInputProps, Group, Image, Stack, TextInput } from "@mantine/core"
import { Controller, type FieldValues } from "react-hook-form"
import type { InputProducerResult } from "./types"

export function createImageInput<F extends FieldValues>({
  ...props
}: Omit<FileInputProps, "error"> & {
  onFileUpload: (file: File) => Promise<string>
  existingImageUrl?: string
  acceptGif?: boolean
}): InputProducerResult<F> {
  return function FormImageInput({ name, control }) {
    let accept = "image/png,image/jpeg,image/jpg"

    if (props.acceptGif) {
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
                  {...props}
                  accept={accept}
                  placeholder={field.value ?? props.existingImageUrl ?? "Klikk for å velge fil"}
                  onChange={async (file) => {
                    if (file === null) {
                      return
                    }
                    const result = await props.onFileUpload(file)
                    field.onChange(result)
                  }}
                />
                <TextInput
                  // Margin is eyeballed to align with the FileInput height
                  mt="1.5rem"
                  placeholder="https://..."
                  onChange={async (event) => field.onChange(event.target.value)}
                  value={field.value ?? ""}
                  flex="1"
                />
              </Group>
              <Button w="fit-content" color="gray" size="xs" variant="outline" onClick={() => field.onChange(null)}>
                Fjern fil
              </Button>
            </Stack>
            {(field.value ?? props.existingImageUrl) && (
              <Image src={field.value ?? props.existingImageUrl} radius="md" maw="max(20dvw, 32rem)" />
            )}
          </>
        )}
      />
    )
  }
}
