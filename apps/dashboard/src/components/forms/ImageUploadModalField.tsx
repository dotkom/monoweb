"use client"

import { Button, ImageUploadModal, type AspectRatio } from "@dotkomonline/ui"
import { IconPhoto, IconX } from "@tabler/icons-react"
import { useState } from "react"
import type { Control, FieldValues, Path } from "react-hook-form"
import { useController } from "react-hook-form"
import { FieldShell, getFieldErrorMessage } from "./FieldShell"

type ImageUploadModalFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label?: string
  description?: string
  required?: boolean
  onFileUpload: (file: File) => Promise<string>
  maxSizeKiB?: number
  aspectRatio?: AspectRatio
  acceptGif?: boolean
  withMetadata?: boolean
  disabled?: boolean
}

export function ImageUploadModalField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  onFileUpload,
  maxSizeKiB,
  aspectRatio,
  acceptGif,
  withMetadata = false,
  disabled,
}: ImageUploadModalFieldProps<TFieldValues>) {
  const { field, fieldState } = useController({ control, name })
  const error = getFieldErrorMessage(fieldState.error?.message)
  const [open, setOpen] = useState(false)
  const id = String(name)

  const imageUrl = typeof field.value === "string" ? field.value : ""

  return (
    <FieldShell id={id} label={label} description={description} required={required} error={error}>
      <div className="flex flex-col gap-3">
        {imageUrl && (
          /** biome-ignore lint/performance/noImgElement: This should be img */
          <img
            src={imageUrl}
            alt=""
            className="max-h-64 max-w-full rounded-md border border-field-border object-contain dark:bg-white"
          />
        )}
        <div className="flex flex-wrap gap-2">
          <Button disabled={disabled} onClick={() => setOpen(true)}>
            <IconPhoto className="size-4" />
            {imageUrl ? "Endre bilde" : "Last opp bilde"}
          </Button>
          {imageUrl && (
            <Button variant="ghost" disabled={disabled} onClick={() => field.onChange(null)}>
              <IconX className="size-4" />
              Fjern bilde
            </Button>
          )}
        </div>
      </div>

      <ImageUploadModal
        open={open}
        onOpenChange={setOpen}
        onFileUpload={onFileUpload}
        maxSizeKiB={maxSizeKiB}
        aspectRatio={aspectRatio}
        acceptGif={acceptGif}
        withMetadata={withMetadata}
        onSubmit={async (url) => {
          field.onChange(url)
        }}
      />
    </FieldShell>
  )
}
