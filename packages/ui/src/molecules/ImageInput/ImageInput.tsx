"use client"

import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react"
import { useCallback, useMemo, useState, type ReactNode } from "react"
import { useDropzone, type FileRejection } from "react-dropzone"
import { Button } from "../../atoms/Button/Button"
import { TextInput } from "../../atoms/Input/TextInput"
import { Text } from "../../atoms/Typography/Text"
import { cn } from "../../utils"
import { Alert } from "../Alert/Alert"

const ASPECT_RATIO_TOLERANCE = 0.05 as const

export type AspectRatio = {
  width: number
  height: number
}

export type ImageInputProps = {
  value: string | null | undefined
  onChange: (imageUrl: string) => void
  onFileUpload: (file: File) => Promise<string>
  label?: ReactNode
  description?: ReactNode
  error?: string
  existingImageUrl?: string
  disabled?: boolean
  acceptGif?: boolean
  maxSizeKiB?: number
  aspectRatio?: AspectRatio
  className?: string
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

function getAccept(acceptGif: boolean | undefined) {
  const accept: Record<string, string[]> = {
    "image/png": [".png"],
    "image/jpeg": [".jpg", ".jpeg"],
    "image/webp": [".webp"],
  }

  if (acceptGif) {
    accept["image/gif"] = [".gif"]
  }

  return accept
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

export function ImageInput({
  value,
  onChange,
  onFileUpload,
  label,
  description,
  error: errorFromParent,
  existingImageUrl,
  disabled,
  acceptGif,
  maxSizeKiB,
  aspectRatio,
  className,
}: ImageInputProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [aspectRatioWarning, setAspectRatioWarning] = useState<string | null>(null)

  const maxSizeDescription = maxSizeKiB ? `Maks filstørrelse er ${maxSizeKiB / 1024} MiB` : undefined
  const maxSizeBytes = maxSizeKiB ? maxSizeKiB * 1024 : undefined

  const wrapperDescription = (
    <>
      {description}
      {maxSizeDescription && <> ({maxSizeDescription})</>}
    </>
  )

  const previewUrl = value || existingImageUrl
  const displayError = errorFromParent ?? uploadError ?? undefined

  const uploadFile = useCallback(
    async (file: File) => {
      if (maxSizeKiB && file.size > maxSizeKiB * 1024) {
        setUploadError(`Filen er for stor. ${maxSizeDescription}.`)
        return
      }

      setUploadError(null)

      const objectUrl = URL.createObjectURL(file)
      const warning = await getAspectRatioWarning(objectUrl, aspectRatio)
      URL.revokeObjectURL(objectUrl)

      setAspectRatioWarning(warning)

      try {
        const result = await onFileUpload(file)
        onChange(result)
      } catch {
        setUploadError("Kunne ikke laste opp filen.")
      }
    },
    [aspectRatio, maxSizeDescription, maxSizeKiB, onChange, onFileUpload]
  )

  const handleDrop = useCallback(
    async (files: File[]) => {
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
    },
    [uploadFile]
  )

  const handleDropRejected = useCallback(
    (rejections: FileRejection[]) => {
      const firstRejection = rejections[0]
      const firstError = firstRejection?.errors[0]

      if (firstError?.code === "file-too-large") {
        setUploadError(`Filen er for stor. ${maxSizeDescription}.`)
        return
      }

      setUploadError(firstError?.message ?? "Kunne ikke laste opp filen.")
    },
    [maxSizeDescription]
  )

  const accept = useMemo(() => getAccept(acceptGif), [acceptGif])

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop: (acceptedFiles) => {
      void handleDrop(acceptedFiles)
    },
    onDropRejected: handleDropRejected,
    accept,
    maxSize: maxSizeBytes,
    maxFiles: 1,
    disabled: disabled || isUploading,
    multiple: false,
  })

  const dropzoneIcon = isDragAccept ? (
    <IconUpload size={40} className="text-primary" stroke={1.75} />
  ) : isDragReject ? (
    <IconX size={40} className="text-destructive" stroke={1.75} />
  ) : (
    <IconPhoto size={40} className="text-muted-foreground" stroke={1.75} />
  )

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-2">
        {label && (
          <Text element="label" className="text-sm font-medium text-foreground">
            {label}
          </Text>
        )}
        {wrapperDescription && <Text className="text-xs text-muted-foreground">{wrapperDescription}</Text>}
        {displayError && <Text className="text-xs text-destructive">{displayError}</Text>}

        <div
          {...getRootProps()}
          className={cn(
            "flex min-h-30 cursor-pointer items-center justify-center rounded-md border border-border bg-muted/40 p-3 transition-colors",
            isDragActive && "border-primary bg-muted",
            (disabled || isUploading) && "pointer-events-none opacity-60"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-wrap items-center justify-center gap-4 pointer-events-none">
            {dropzoneIcon}
            <div className="text-center sm:text-left">
              <Text className="text-sm">
                {isUploading ? "Laster opp…" : "Dra bildet hit, eller klikk for å velge fil"}
              </Text>
              <Text className="mt-1 text-xs text-muted-foreground">
                PNG, JPG{acceptGif ? ", WEBP eller GIF" : " eller WEBP"}
              </Text>
            </div>
          </div>
        </div>

        <TextInput
          label="Eller lim inn en URL"
          placeholder="https://..."
          disabled={disabled}
          value={value ?? ""}
          onChange={async (event) => {
            const nextValue = event.target.value
            setUploadError(null)

            if (!nextValue) {
              onChange("")
              setAspectRatioWarning(null)
              return
            }

            onChange(nextValue)
            setAspectRatioWarning(await getAspectRatioWarning(nextValue, aspectRatio))
          }}
        />
      </div>

      {aspectRatioWarning && (
        <Alert status="warning" title="Advarsel" showIcon>
          {aspectRatioWarning}
        </Alert>
      )}

      {previewUrl && (
        <div className="flex flex-col gap-2">
          <Text className="text-sm text-muted-foreground">Forhåndsvisning</Text>
          {/** biome-ignore lint/performance/noImgElement: We're not in Next.js, dummy */}
          <img
            src={previewUrl}
            alt="Forhåndsvisning av bilde"
            className="max-h-96 max-w-full rounded-md object-contain"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            color="red"
            className="w-fit"
            disabled={disabled}
            icon={<IconX size={16} />}
            onClick={() => {
              setAspectRatioWarning(null)
              onChange("")
            }}
          >
            Fjern fil
          </Button>
        </div>
      )}
    </div>
  )
}
