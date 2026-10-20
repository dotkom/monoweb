"use client"

import { USER_IMAGE_MAX_SIZE_KIB } from "@dotkomonline/rpc/user"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  cn,
  IMAGE_PICK_MAX_SIZE_KIB,
  ImageDropZone,
  Text,
  useCropImage,
  type CropImageError,
} from "@dotkomonline/ui"
import { IconCamera, IconLoader2, IconUser } from "@tabler/icons-react"
import { useState } from "react"
import { ProfileImageCropModal } from "./ProfileImageCropModal"
import type { UploadProfileImageResult } from "./use-upload-profile-image"

const PROFILE_IMAGE_OUTPUT_SIZE = { maxWidth: 512, maxHeight: 512 } as const

type ProfileImageUploadError = CropImageError | "UPLOAD_FAILED"

export type ProfileImageUploadInputProps = {
  imageUrl: string | null
  onSubmit: (file: File) => Promise<UploadProfileImageResult>
  alwaysShowInteractableOverlay?: boolean
  className?: string
}

function messageFor(error: ProfileImageUploadError): string {
  switch (error) {
    case "FILE_TOO_LARGE":
      return `Filen er for stor. Maks filstørrelse er ${USER_IMAGE_MAX_SIZE_KIB / 1024} MiB.`
    case "PROCESSING_ERROR":
    case "EXPORT_FAILED":
      return "Kunne ikke behandle bildet. Prøv et annet bildeformat."
    case "NOT_READY":
      return "Bildet er ikke klart ennå."
    case "UPLOAD_FAILED":
      return "Opplasting av profilbilde feilet."
  }
}

export function ProfileImageUploadInput({
  imageUrl,
  onSubmit,
  alwaysShowInteractableOverlay = false,
  className,
}: ProfileImageUploadInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cropImage = useCropImage({
    outputSize: PROFILE_IMAGE_OUTPUT_SIZE,
    maxExportKiB: USER_IMAGE_MAX_SIZE_KIB,
  })

  const isBusy = isSubmitting || cropImage.isPreparing

  const handleCloseFinished = () => {
    if (isOpen) {
      return
    }

    cropImage.reset()
    setIsSubmitting(false)
  }

  const uploadPreparedFile = async (file: File, shouldCloseModal: boolean) => {
    const uploaded = await onSubmit(file)

    if (!uploaded.success) {
      setError(messageFor(uploaded.error))
      setIsSubmitting(false)

      return
    }

    setError(null)

    if (shouldCloseModal) {
      setIsOpen(false)
    } else {
      setIsSubmitting(false)
    }
  }

  const handleFile = async (file: File) => {
    setError(null)

    const shouldCrop = file.type !== "image/gif"
    if (shouldCrop) {
      setIsOpen(true)
    } else {
      setIsSubmitting(true)
    }

    const prepared = await cropImage.prepare(file)
    if (!prepared.success) {
      setError(messageFor(prepared.error))
      setIsSubmitting(false)
      setIsOpen(false)

      return
    }

    if (!prepared.needsCrop) {
      await uploadPreparedFile(prepared.file, false)
    }
  }

  const handleConfirm = async () => {
    setError(null)
    setIsSubmitting(true)

    const exported = await cropImage.exportCrop()
    if (!exported.success) {
      setError(messageFor(exported.error))
      setIsSubmitting(false)

      return
    }

    await uploadPreparedFile(exported.file, true)
  }

  return (
    <div className="flex w-fit shrink-0 flex-col gap-1">
      <ImageDropZone
        accept={{
          "image/png": [".png"],
          "image/jpeg": [".jpg", ".jpeg"],
          "image/webp": [".webp"],
          "image/gif": [".gif"],
        }}
        maxSizeKiB={IMAGE_PICK_MAX_SIZE_KIB}
        disabled={isBusy || isOpen}
        onFile={(file) => {
          void handleFile(file)
        }}
        onReject={(fileError) => {
          if (fileError.code === "file-too-large") {
            setError(`Filen er for stor. Maks filstørrelse er ${IMAGE_PICK_MAX_SIZE_KIB / 1024} MiB.`)

            return
          }

          setError("Kunne ikke velge filen.")
        }}
        className={cn("size-16 cursor-pointer rounded-full md:size-32", className)}
      >
        {({ isDragActive }) => (
          <>
            <Avatar className="pointer-events-none size-full">
              <AvatarImage src={imageUrl ?? undefined} className="object-cover" />
              <AvatarFallback className="bg-gray-200 dark:bg-stone-600">
                <IconUser width={64} height={64} />
              </AvatarFallback>
            </Avatar>
            <div className="group absolute inset-0 flex items-center justify-center rounded-full">
              <div
                className={cn(
                  "absolute inset-0 rounded-full bg-black/40 opacity-0 transition-opacity",
                  "group-hover:opacity-100 group-focus-within:opacity-100",
                  (isDragActive || isBusy) && "opacity-100"
                )}
              />
              {isBusy && !isOpen ? (
                <IconLoader2 className="relative text-white motion-safe:animate-spin motion-reduce:hidden" />
              ) : (
                <IconCamera
                  className={cn(
                    "relative text-white opacity-0 transition-opacity",
                    "group-hover:opacity-100 group-focus-within:opacity-100",
                    (isDragActive || alwaysShowInteractableOverlay) && "opacity-100"
                  )}
                />
              )}
            </div>
          </>
        )}
      </ImageDropZone>
      {error !== null && !isOpen && <Text className="text-red-600 dark:text-red-400 max-w-48 text-xs">{error}</Text>}
      <ProfileImageCropModal
        isOpen={isOpen}
        previewUrl={cropImage.previewUrl}
        onClose={() => setIsOpen(false)}
        onCloseFinished={handleCloseFinished}
        onCropChange={cropImage.onCropChange}
        onConfirm={handleConfirm}
        isSubmitting={isSubmitting}
        isCropReady={cropImage.isCropReady}
        error={error}
      />
    </div>
  )
}
