"use client"

import { type FormEvent, useState } from "react"
import { Button } from "../../atoms/Button/Button"
import { TextInput } from "../../atoms/Input/TextInput"
import { Text } from "../../atoms/Typography/Text"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTitle,
} from "../Dialog/Dialog"
import { type AspectRatio, ImageInput } from "../ImageInput/ImageInput"
import { IconX } from "@tabler/icons-react"

export type ImageUploadModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (fileUrl: string, alt: string, title: string | undefined) => void | Promise<void>
  onFileUpload: (file: File) => Promise<string>
  maxSizeKiB?: number
  aspectRatio?: AspectRatio
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
  acceptGif,
  withMetadata = true,
}: ImageUploadModalProps) {
  const [imageUrl, setImageUrl] = useState("")
  const [alt, setAlt] = useState("")
  const [title, setTitle] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)

    const trimmedUrl = imageUrl.trim()

    if (!trimmedUrl) {
      setFormError("Last opp et bilde eller lim inn en URL.")
      return
    }

    try {
      const parsed = new URL(trimmedUrl)
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        setFormError("URL må starte med http eller https.")
        return
      }
    } catch {
      setFormError("Ugyldig bilde-URL.")
      return
    }

    if (withMetadata) {
      const trimmedAlt = alt.trim()

      if (!trimmedAlt) {
        setFormError("Alt-tekst er påkrevd.")
        return
      }

      if (trimmedAlt.length > 255) {
        setFormError("Alt-tekst kan ikke være lengre enn 255 tegn.")
        return
      }

      const trimmedTitle = title.trim()

      if (trimmedTitle.length > 255) {
        setFormError("Bildetittel kan ikke være lengre enn 255 tegn.")
        return
      }

      setIsSubmitting(true)

      try {
        await onSubmit(trimmedUrl, trimmedAlt, trimmedTitle || undefined)
        handleOpenChange(false)
      } finally {
        setIsSubmitting(false)
      }

      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit(trimmedUrl, "", undefined)
      handleOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent
        size="lg"
        onOutsideClick={() => handleOpenChange(false)}
        className="max-h-[90dvh] overflow-auto"
      >
        <div className="flex flex-row items-center justify-between gap-4">
          <AlertDialogTitle>Last opp bilde</AlertDialogTitle>
          <AlertDialogCancel>
            <IconX className="size-5" />
          </AlertDialogCancel>
        </div>

        {withMetadata && (
          <Text className="text-sm text-muted-foreground">
            Dersom bildet blir plassert feil, kan du holde-og-dra bildet dit du ønsker det
          </Text>
        )}

        <form className="flex flex-col gap-4" onSubmit={(event) => void handleSubmit(event)}>
          <ImageInput
            label="Bilde"
            value={imageUrl}
            onChange={setImageUrl}
            onFileUpload={onFileUpload}
            maxSizeKiB={maxSizeKiB}
            aspectRatio={aspectRatio}
            acceptGif={acceptGif}
          />

          {formError && <Text className="text-sm text-destructive">{formError}</Text>}

          {withMetadata && (
            <>
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
            </>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={isSubmitting}>
              Avbryt
            </AlertDialogCancel>
            <Button type="submit" variant="default" disabled={isSubmitting}>
              {withMetadata ? "Last opp bilde" : "Lagre"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
