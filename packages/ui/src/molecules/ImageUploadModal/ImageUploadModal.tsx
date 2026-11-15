"use client"

import { IconLoader2, IconX } from "@tabler/icons-react"
import { useRef, useState, type ReactNode } from "react"
import { Button } from "../../atoms/Button/Button"
import { TextInput } from "../../atoms/Input/TextInput"
import { Text } from "../../atoms/Typography/Text"
import {
  DialogBody,
  DialogHeader,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "../Dialog/Dialog"
import { type AspectRatio, ImageInput, type ImageInputHandle } from "../ImageInput/ImageInput"
import type { ImageCropperShape } from "../ImageCropper/ImageCropper"

export type ImageUploadModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (fileUrl: string, alt: string, title: string | undefined) => void | Promise<void>
  onFileUpload: (file: File) => Promise<string>
  maxSizeKiB?: number
  aspectRatio?: AspectRatio
  overlayAspectRatio?: AspectRatio
  cropLegend?: ReactNode
  shape?: ImageCropperShape
  showGrid?: boolean
  acceptGif?: boolean
  withMetadata?: boolean
}

export function ImageUploadModal({
  open,
  onOpenChange,
  onSubmit,
  onFileUpload,
  maxSizeKiB,
  aspectRatio,
  overlayAspectRatio,
  cropLegend,
  acceptGif,
  withMetadata = true,
  shape,
  showGrid,
}: ImageUploadModalProps) {
  const imageInputRef = useRef<ImageInputHandle>(null)
  const [imageUrl, setImageUrl] = useState("")
  const [alt, setAlt] = useState("")
  const [title, setTitle] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [canCommit, setCanCommit] = useState(false)

  const resetForm = () => {
    setImageUrl("")
    setAlt("")
    setTitle("")
    setFormError(null)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm()
    }

    onOpenChange(nextOpen)
  }

  const handleSubmit = async () => {
    setFormError(null)
    setIsSubmitting(true)

    const uploadedUrl = await imageInputRef.current?.commit()
    const trimmedUrl = uploadedUrl?.trim() ?? ""

    if (trimmedUrl === "") {
      setIsSubmitting(false)
      return
    }

    try {
      const parsed = new URL(trimmedUrl)
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        setFormError("URL må starte med http eller https.")
        setIsSubmitting(false)
        return
      }
    } catch {
      setFormError("Ugyldig bilde-URL.")
      setIsSubmitting(false)
      return
    }

    if (withMetadata) {
      const trimmedAlt = alt.trim()

      if (trimmedAlt === "") {
        setFormError("Alt-tekst er påkrevd.")
        setIsSubmitting(false)
        return
      }

      if (trimmedAlt.length > 255) {
        setFormError("Alt-tekst kan ikke være lengre enn 255 tegn.")
        setIsSubmitting(false)
        return
      }

      const trimmedTitle = title.trim()

      if (trimmedTitle.length > 255) {
        setFormError("Bildetittel kan ikke være lengre enn 255 tegn.")
        setIsSubmitting(false)
        return
      }

      try {
        await onSubmit(trimmedUrl, trimmedAlt, trimmedTitle === "" ? undefined : trimmedTitle)
      } catch {
        setIsSubmitting(false)
        return
      }

      handleOpenChange(false)
      return
    }

    try {
      await onSubmit(trimmedUrl, "", undefined)
    } catch {
      setIsSubmitting(false)
      return
    }

    handleOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      onOpenChangeComplete={(nextOpen) => {
        if (!nextOpen) {
          setIsSubmitting(false)
        }
      }}
    >
      <DialogContent size="lg">
        <DialogHeader className="flex flex-row items-center justify-between gap-4">
          <DialogTitle>Last opp bilde</DialogTitle>
          <DialogClose>
            <IconX className="size-5" />
          </DialogClose>
        </DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-4">
            {withMetadata && (
              <Text className="text-sm text-muted-foreground">
                Dersom bildet blir plassert feil, kan du holde-og-dra bildet dit du ønsker det
              </Text>
            )}

            <div className="flex flex-col gap-4">
              <ImageInput
                ref={imageInputRef}
                label="Bilde"
                value={imageUrl}
                onChange={setImageUrl}
                onFileUpload={onFileUpload}
                maxSizeKiB={maxSizeKiB}
                aspectRatio={aspectRatio}
                overlayAspectRatio={overlayAspectRatio}
                cropLegend={cropLegend}
                shape={shape}
                acceptGif={acceptGif}
                showGrid={showGrid}
                hideSubmitButton
                disabled={isSubmitting}
                onCanCommitChange={setCanCommit}
              />

              {formError && <Text className="text-sm text-destructive">{formError}</Text>}

              {withMetadata && (
                <div className="flex flex-col gap-4">
                  <TextInput
                    label="Alt-tekst"
                    description="Vises dersom bildet ikke kan lastes inn, og brukes av skjermlesere."
                    placeholder="Hytteoversikt for Åre"
                    required
                    value={alt}
                    onChange={(event) => setAlt(event.target.value)}
                  />
                  <TextInput
                    label="Bildetittel"
                    description="Vises når man holder musepekeren over bildet."
                    placeholder="Hytteoversikt for Åre"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="-mx-5 -mb-5 rounded-b-2xl p-5 sm:-mx-6 sm:-mb-6 sm:p-6">
          <DialogClose type="button" disabled={isSubmitting}>
            Avbryt
          </DialogClose>
          <Button
            onClick={handleSubmit}
            variant="default"
            disabled={isSubmitting || !canCommit}
            icon={
              isSubmitting ? (
                <IconLoader2 className="motion-safe:animate-spin motion-reduce:hidden" aria-hidden />
              ) : undefined
            }
          >
            {withMetadata ? "Last opp bilde" : "Lagre"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
