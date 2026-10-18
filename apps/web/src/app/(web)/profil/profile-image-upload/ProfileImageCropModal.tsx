"use client"

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  ImageCropper,
  Text,
  type ImageCropperArea,
} from "@dotkomonline/ui"
import { IconLoader2 } from "@tabler/icons-react"

export type ProfileImageCropModalProps = {
  previewUrl: string | null
  isOpen: boolean
  onClose: () => void
  onCloseFinished: () => void
  onCropChange: (croppedArea: ImageCropperArea, croppedAreaPixels: ImageCropperArea) => void
  onConfirm: () => Promise<void>
  isSubmitting?: boolean
  isCropReady?: boolean
  error?: string | null
}

export function ProfileImageCropModal({
  previewUrl,
  isOpen,
  onClose,
  onCloseFinished,
  onCropChange,
  onConfirm,
  isSubmitting = false,
  isCropReady = false,
  error = null,
}: ProfileImageCropModalProps) {
  const hasPreviewUrl = previewUrl !== null

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !isSubmitting) {
      onClose()
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
      onOpenChangeComplete={(nextOpen) => {
        if (!nextOpen) {
          onCloseFinished()
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rediger profilbilde</DialogTitle>
        </DialogHeader>
        <div className="relative h-96 w-full">
          <ImageCropper
            objectUrl={previewUrl}
            aspectRatio={{ width: 1, height: 1 }}
            shape="round"
            onChange={onCropChange}
            disabled={isSubmitting}
          />
        </div>
        {error !== null && <Text className="text-red-600 dark:text-red-400 text-xs">{error}</Text>}
        <DialogFooter className="border-none bg-transparent">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Avbryt
          </Button>
          <Button
            variant="default"
            onClick={() => void onConfirm()}
            disabled={isSubmitting || !hasPreviewUrl || !isCropReady}
            icon={
              isSubmitting ? (
                <IconLoader2 className="motion-safe:animate-spin motion-reduce:hidden" aria-hidden />
              ) : undefined
            }
          >
            Bruk profilbilde
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
