import { Alert, Button, Group, Image, Input, Stack, Text, TextInput, type FileInputProps } from "@mantine/core"
import { Dropzone, MIME_TYPES, type FileWithPath } from "@mantine/dropzone"
import { modals } from "@mantine/modals"
import { IconAlertTriangle, IconPhoto, IconUpload, IconX } from "@tabler/icons-react"
import { type ReactNode, useState } from "react"
import { Controller, type FieldValues } from "react-hook-form"
import type { InputProducerResult } from "./types"

const ASPECT_RATIO_TOLERANCE = 0.05 as const

export type AspectRatio = {
  width: number
  height: number
}

function getImageDimensions(source: string): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const image = new window.Image()

    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
    }

    image.onerror = () => {
      resolve(null)
    }

    image.src = source
  })
}

async function doesImageMatchAspectRatio(source: string, aspectRatio: AspectRatio): Promise<boolean> {
  const dimensions = await getImageDimensions(source)

  if (dimensions === null) {
    return true
  }

  const expectedRatio = aspectRatio.width / aspectRatio.height
  const actualRatio = dimensions.width / dimensions.height

  return Math.abs(actualRatio - expectedRatio) / expectedRatio <= ASPECT_RATIO_TOLERANCE
}

function getAcceptedMimeTypes(acceptGif: boolean | undefined) {
  const acceptedMimeTypes = [MIME_TYPES.png, MIME_TYPES.jpeg, MIME_TYPES.webp]

  if (acceptGif) {
    return [...acceptedMimeTypes, MIME_TYPES.gif]
  }

  return acceptedMimeTypes
}

function getAspectRatioWarning(source: string, aspectRatio: AspectRatio | undefined): Promise<string | null> {
  if (aspectRatio === undefined) {
    return Promise.resolve(null)
  }

  return doesImageMatchAspectRatio(source, aspectRatio).then((matches) => {
    if (matches) {
      return null
    }

    return `Bildet har ikke det anbefalte sideforholdet ${aspectRatio.width}:${aspectRatio.height}.`
  })
}

// chungus interface
interface ImageDropzoneFieldProps {
  label?: ReactNode
  description?: ReactNode
  error?: ReactNode
  existingImageUrl?: string
  value: string | null | undefined
  disabled?: boolean
  acceptGif?: boolean
  maxSizeKiB?: number
  aspectRatio?: AspectRatio
  onFileUpload: (file: File) => Promise<string>
  onChange: (imageUrl: string) => void
  onClear: () => void
  onError: (message: string) => void
  onClearError: () => void
  onAspectRatioWarning: (warning: string | null) => void
}

function ImageDropzoneField({
  label,
  description,
  error,
  existingImageUrl,
  value,
  disabled,
  acceptGif,
  maxSizeKiB,
  aspectRatio,
  onFileUpload,
  onChange,
  onClear,
  onError,
  onClearError,
  onAspectRatioWarning,
}: ImageDropzoneFieldProps) {
  const [isUploading, setIsUploading] = useState(false)

  const maxSizeDescription = maxSizeKiB ? `Maks filstørrelse er ${maxSizeKiB / 1024} MiB` : undefined
  const maxSizeBytes = maxSizeKiB ? maxSizeKiB * 1024 : undefined

  const wrapperDescription = (
    <>
      {description}
      {maxSizeDescription && <> ({maxSizeDescription})</>}
    </>
  )

  const previewUrl = value || existingImageUrl

  const uploadFile = async (file: File) => {
    if (maxSizeKiB && file.size > maxSizeKiB * 1024) {
      onError(`Filen er for stor. ${maxSizeDescription}.`)
      return
    }

    onClearError()

    const objectUrl = URL.createObjectURL(file)
    const aspectRatioWarning = await getAspectRatioWarning(objectUrl, aspectRatio)
    URL.revokeObjectURL(objectUrl)

    onAspectRatioWarning(aspectRatioWarning)

    const result = await onFileUpload(file)
    onChange(result)
  }

  const handleDrop = async (files: FileWithPath[]) => {
    const file = files[0]

    if (!file) {
      return
    }

    setIsUploading(true)

    try {
      await uploadFile(file)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Stack gap="md">
      <Input.Wrapper label={label} description={wrapperDescription} error={error}>
        <Stack gap="sm" mt="0.25rem" mb="0.5rem">
          <Dropzone
            onDrop={handleDrop}
            onReject={(fileRejections) => {
              const firstRejection = fileRejections[0]
              const firstError = firstRejection?.errors[0]

              if (firstError?.code === "file-too-large") {
                onError(`Filen er for stor. ${maxSizeDescription}.`)
                return
              }

              onError(firstError?.message ?? "Kunne ikke laste opp filen.")
            }}
            maxSize={maxSizeBytes}
            accept={getAcceptedMimeTypes(acceptGif)}
            maxFiles={1}
            disabled={disabled || isUploading}
            loading={isUploading}
            style={{
              cursor: "pointer",
              borderRadius: "var(--mantine-radius-default)",
              backgroundColor: "rgba(0, 0, 0, 0.05)",
              padding: "var(--mantine-spacing-sm)",
              // This was copied from Mantine inputs in dev tools
              border: "calc(0.0625rem * var(--mantine-scale)) solid var(--mantine-color-default-border)",
            }}
          >
            <Group justify="center" gap="md" mih={120} style={{ pointerEvents: "none" }}>
              <Dropzone.Accept>
                <IconUpload size={40} color="var(--mantine-color-blue-6)" stroke={1.75} />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <IconX size={40} color="var(--mantine-color-red-6)" stroke={1.75} />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <IconPhoto size={40} color="var(--mantine-color-dimmed)" stroke={1.75} />
              </Dropzone.Idle>

              <div>
                <Text size="md" inline>
                  Dra bildet hit, eller klikk for å velge fil
                </Text>
                <Text size="sm" c="dimmed" inline mt={7}>
                  PNG, JPG{acceptGif ? ", WEBP eller GIF" : " eller WEBP"}
                </Text>
              </div>
            </Group>
          </Dropzone>

          <TextInput
            label="Eller lim inn en URL"
            placeholder="https://..."
            disabled={disabled}
            value={value ?? ""}
            onChange={async (event) => {
              const nextValue = event.target.value
              onClearError()

              if (!nextValue) {
                onChange("")
                onAspectRatioWarning(null)
                return
              }

              onChange(nextValue)
              onAspectRatioWarning(await getAspectRatioWarning(nextValue, aspectRatio))
            }}
          />
        </Stack>
      </Input.Wrapper>

      {previewUrl && (
        <Stack gap="xs" mt="1rem">
          <Text size="sm" c="dimmed">
            Forhåndsvisning
          </Text>
          <Image src={previewUrl} radius="default" maw="max(20dvw, 32rem)" />
          <Button
            w="fit-content"
            color="red"
            size="xs"
            variant="subtle"
            disabled={disabled}
            onClick={onClear}
            leftSection={<IconX size="1rem" />}
            styles={{ section: { marginRight: "0.35rem" } }}
          >
            Fjern fil
          </Button>
        </Stack>
      )}
    </Stack>
  )
}

export function createImageInput<F extends FieldValues>({
  ...props
}: Omit<FileInputProps, "error"> & {
  onFileUpload: (file: File) => Promise<string>
  existingImageUrl?: string
  acceptGif?: boolean
  maxSizeKiB?: number
  aspectRatio?: AspectRatio
}): InputProducerResult<F> {
  const { onFileUpload, existingImageUrl, acceptGif, maxSizeKiB, aspectRatio, label, description } = props

  return function FormImageInput({ name, control, setError, clearErrors, disabled }) {
    const [aspectRatioWarning, setAspectRatioWarning] = useState<string | null>(null)

    return (
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <Stack gap="0.5rem">
            <ImageDropzoneField
              label={label}
              description={description}
              error={fieldState.error?.message}
              existingImageUrl={existingImageUrl}
              value={field.value}
              disabled={disabled ?? props.disabled}
              acceptGif={acceptGif}
              maxSizeKiB={maxSizeKiB}
              aspectRatio={aspectRatio}
              onFileUpload={onFileUpload}
              onChange={field.onChange}
              onClear={() => {
                setAspectRatioWarning(null)
                field.onChange(null)
              }}
              onError={(message) => setError(name, { type: "manual", message })}
              onClearError={() => clearErrors(name)}
              onAspectRatioWarning={setAspectRatioWarning}
            />
            {aspectRatioWarning && (
              <Alert color="yellow" icon={<IconAlertTriangle size="1rem" />} variant="light">
                <Text size="sm">{aspectRatioWarning}</Text>
              </Alert>
            )}
          </Stack>
        )}
      />
    )
  }
}

export function createModalImageInput<F extends FieldValues>({
  label,
  description,
  onFileUpload,
  maxSizeKiB,
  aspectRatio,
}: {
  label: string
  description?: ReactNode
  onFileUpload: (file: File) => Promise<string>
  maxSizeKiB?: number
  aspectRatio?: AspectRatio
}): InputProducerResult<F> {
  return function FormModalImageInput({ name, control, disabled }) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const openUploadModal = () => {
            modals.openContextModal({
              modal: "image/upload",
              title: "Last opp bilde",
              size: "lg",
              innerProps: {
                onFileUpload,
                maxSizeKiB,
                aspectRatio,
                withMetadata: false,
                handleSubmit: async (imageUrl: string) => {
                  field.onChange(imageUrl)
                },
              },
            })
          }

          return (
            <Input.Wrapper label={label} description={description}>
              <Stack gap="0.5rem">
                {field.value && <Image src={field.value} radius="md" maw="max(20dvw, 32rem)" />}
                <Group gap="xs" mt="0.25rem">
                  <Button
                    variant="default"
                    leftSection={<IconPhoto size="1rem" />}
                    onClick={openUploadModal}
                    disabled={disabled}
                  >
                    {field.value ? "Endre bilde" : "Last opp bilde"}
                  </Button>
                  {field.value && (
                    <Button
                      color="gray"
                      size="compact-sm"
                      variant="subtle"
                      disabled={disabled}
                      onClick={() => field.onChange(null)}
                      leftSection={<IconX size="1rem" />}
                    >
                      Fjern bilde
                    </Button>
                  )}
                </Group>
              </Stack>
            </Input.Wrapper>
          )
        }}
      />
    )
  }
}
