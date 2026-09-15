"use client"

import { IconUpload, IconX } from "@tabler/icons-react"
import { useId, useRef, useState, type ChangeEvent, type ReactNode } from "react"
import { Button } from "../../atoms/Button/Button"
import { Label } from "../../atoms/Label/Label"
import { Text } from "../../atoms/Typography/Text"
import { cn } from "../../utils"

export type FileInputProps = {
  value: string | null | undefined
  onChange: (fileUrl: string | null) => void
  onFileUpload: (file: File) => Promise<string>
  label?: ReactNode
  description?: ReactNode
  error?: string
  existingFileUrl?: string
  disabled?: boolean
  required?: boolean
  accept?: string
  maxSizeKiB?: number
  warnSizeKiB?: number
  warnSizeDescription?: string
  className?: string
}

function getDisplayNameFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname
    const segment = path.split("/").filter(Boolean).pop()
    if (segment) {
      return decodeURIComponent(segment)
    }
  } catch {}

  const fallback = url.split("/").filter(Boolean).pop()
  if (fallback) {
    return decodeURIComponent(fallback)
  }

  return url
}

export function FileInput({
  value,
  onChange,
  onFileUpload,
  label,
  description,
  error: errorFromParent,
  existingFileUrl,
  disabled,
  required,
  accept,
  maxSizeKiB,
  warnSizeKiB,
  warnSizeDescription,
  className,
}: FileInputProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [warnSizeError, setWarnSizeError] = useState<string | null>(null)
  const [lastUploadedFile, setLastUploadedFile] = useState<File | null>(null)

  const maxSizeDescription = maxSizeKiB ? `Maks filstørrelse er ${maxSizeKiB / 1024} MiB` : undefined

  const wrapperDescription = (
    <>
      {description}
      {maxSizeDescription && <> ({maxSizeDescription})</>}
    </>
  )

  const effectiveUrl = value || existingFileUrl
  const displayName =
    lastUploadedFile?.name ?? (effectiveUrl ? getDisplayNameFromUrl(effectiveUrl) : null) ?? "Ingen fil valgt"

  const displayError = errorFromParent ?? uploadError ?? undefined
  const canClear = !required && Boolean(value)

  const uploadFile = async (file: File) => {
    setUploadError(null)
    setWarnSizeError(null)
    setIsUploading(true)

    try {
      const url = await onFileUpload(file)
      setLastUploadedFile(file)
      onChange(url)
    } catch {
      setUploadError("Kunne ikke laste opp filen.")
      setLastUploadedFile(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) {
      return
    }

    if (maxSizeKiB && file.size > maxSizeKiB * 1024) {
      setUploadError(`Filen er for stor. ${maxSizeDescription}.`)
      return
    }

    setUploadError(null)

    if (warnSizeKiB && file.size > warnSizeKiB * 1024) {
      setWarnSizeError(
        warnSizeDescription ?? `Filen er over ${warnSizeKiB / 1024} MiB. Er du sikker på at du vil fortsette?`
      )

      setLastUploadedFile(file)
      return
    }

    void uploadFile(file)
  }

  const handleClear = () => {
    setUploadError(null)
    setWarnSizeError(null)
    setLastUploadedFile(null)
    onChange(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {label && (
        <Label htmlFor={inputId} className={cn(disabled && "text-muted-foreground")}>
          {label}
          {required && (
            <Text element="span" className="text-destructive">
              *
            </Text>
          )}
        </Label>
      )}

      {wrapperDescription && <Text className="text-xs text-muted-foreground">{wrapperDescription}</Text>}

      {warnSizeError && <Text className="text-xs text-yellow-600 dark:text-amber-300">{warnSizeError}</Text>}

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          className="sr-only"
          disabled={disabled || isUploading}
          onChange={(event) => void handleFileChange(event)}
        />

        {warnSizeError ? (
          <div className="flex flex-row gap-2">
            <Button
              type="button"
              variant="default"
              color="yellow"
              size="sm"
              disabled={disabled || isUploading}
              icon={<IconUpload size={16} />}
              onClick={() => {
                if (lastUploadedFile !== null) {
                  void uploadFile(lastUploadedFile)
                }
              }}
            >
              Last opp likevel
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setWarnSizeError(null)
                setLastUploadedFile(null)
                onChange(null)

                if (inputRef.current) {
                  inputRef.current.value = ""
                }
              }}
            >
              Avbryt
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="default"
            size="sm"
            disabled={disabled || isUploading}
            icon={<IconUpload size={16} />}
            onClick={() => inputRef.current?.click()}
          >
            {isUploading ? "Laster opp…" : value ? "Bytt fil" : "Velg fil"}
          </Button>
        )}

        <Text className="min-w-0 flex-1 truncate text-sm text-muted-foreground" title={displayName}>
          {displayName}
        </Text>
      </div>

      {displayError && <Text className="text-xs text-destructive">{displayError}</Text>}

      {canClear && (
        <Button
          type="button"
          size="sm"
          color="gray"
          className="w-fit"
          disabled={disabled || isUploading}
          icon={<IconX size={16} />}
          onClick={handleClear}
        >
          Fjern fil
        </Button>
      )}
    </div>
  )
}
