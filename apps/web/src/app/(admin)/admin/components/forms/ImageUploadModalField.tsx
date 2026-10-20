"use client"

import { Button, ImageAspectGuideOverlay, ImageUploadModal, type AspectRatio } from "@dotkomonline/ui"
import { IconPhoto, IconX } from "@tabler/icons-react"
import { useState, type ReactNode } from "react"
import type { Control, FieldValues, Path } from "react-hook-form"
import { useController } from "react-hook-form"
import { combineFieldDisabled, FieldShell, getFieldErrorMessage } from "./FieldShell"

type ImageUploadModalFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label?: string
  description?: string
  required?: boolean
  onFileUpload: (file: File) => Promise<string>
  maxSizeKiB?: number
  aspectRatio?: AspectRatio
  overlayAspectRatio?: AspectRatio
  cropLegend?: ReactNode
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
  overlayAspectRatio,
  cropLegend,
  acceptGif,
  withMetadata = false,
  disabled,
}: ImageUploadModalFieldProps<TFieldValues>) {
  const { field, fieldState } = useController({ control, name })
  const error = getFieldErrorMessage(fieldState.error?.message)
  const [open, setOpen] = useState(false)
  const id = String(name)

  const imageUrl = typeof field.value === "string" ? field.value : ""
  const isDisabled = combineFieldDisabled(field.disabled, disabled)
  const hasAspectGuide = aspectRatio !== undefined && overlayAspectRatio !== undefined

  return (
    <FieldShell id={id} label={label} description={description} required={required} error={error}>
      <div className="flex w-full flex-col gap-3">
        {imageUrl !== "" && aspectRatio !== undefined && overlayAspectRatio !== undefined && (
          <div
            className="relative w-full max-w-2xl overflow-hidden rounded-md border border-field-border bg-muted"
            style={{ aspectRatio: `${aspectRatio.width} / ${aspectRatio.height}` }}
          >
            {/** biome-ignore lint/performance/noImgElement: This should be img */}
            <img src={imageUrl} alt="" className="absolute inset-0 size-full object-contain" />
            <ImageAspectGuideOverlay outerAspectRatio={aspectRatio} innerAspectRatio={overlayAspectRatio} />
          </div>
        )}
        {imageUrl !== "" && !hasAspectGuide && (
          // biome-ignore lint/performance/noImgElement: This should be img
          <img
            src={imageUrl}
            alt=""
            className="block max-h-64 w-auto rounded-md border border-field-border object-contain dark:bg-white"
          />
        )}
        <div className="flex w-fit flex-wrap gap-2">
          <Button type="button" disabled={isDisabled} onClick={() => setOpen(true)}>
            <IconPhoto className="size-4" />
            {imageUrl ? "Endre bilde" : "Last opp bilde"}
          </Button>
          {imageUrl && (
            <Button type="button" variant="ghost" disabled={isDisabled} onClick={() => field.onChange(null)}>
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
        overlayAspectRatio={overlayAspectRatio}
        cropLegend={cropLegend}
        acceptGif={acceptGif}
        withMetadata={withMetadata}
        onSubmit={async (url) => {
          field.onChange(url)
        }}
      />
    </FieldShell>
  )
}
