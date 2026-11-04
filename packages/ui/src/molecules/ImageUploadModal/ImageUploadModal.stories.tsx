import { useState, type ReactNode } from "react"
import { Text } from "../../atoms/Typography/Text"
import type { AspectRatio } from "../ImageInput/ImageInput"
import { ImageUploadModal } from "./ImageUploadModal"

const SAMPLE_IMAGE_URL = "https://picsum.photos/id/1018/1920/1080"

const CARD_ASPECT_RATIO: AspectRatio = { width: 16, height: 9 }
const EVENT_PAGE_ASPECT_RATIO: AspectRatio = { width: 24, height: 9 }
const EVENT_CROP_LEGEND = "Hold hovedmotivet innenfor hvit ramme (16:9)."

export default {
  title: "ImageUploadModal",
}

export const Default = () => {
  return (
    <ModalStory>
      <ImageUploadModalDemo hasCropper />
    </ModalStory>
  )
}

export const WithMetadata = () => {
  return (
    <ModalStory note="With metadata for rich text inserts; cropping is disabled.">
      <ImageUploadModalDemo withMetadata />
    </ModalStory>
  )
}

function ImageUploadModalDemo({
  withMetadata = false,
  hasCropper = false,
}: {
  withMetadata?: boolean
  hasCropper?: boolean
}) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <ImageUploadModal
      open={isOpen}
      onOpenChange={setIsOpen}
      onSubmit={async (url) => {
        console.log(url)
      }}
      onFileUpload={uploadImage}
      maxSizeKiB={5 * 1024}
      aspectRatio={hasCropper ? EVENT_PAGE_ASPECT_RATIO : undefined}
      overlayAspectRatio={hasCropper ? CARD_ASPECT_RATIO : undefined}
      cropLegend={hasCropper ? EVENT_CROP_LEGEND : undefined}
      withMetadata={withMetadata}
    />
  )
}

function ModalStory({ note, children }: { note?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      {note !== undefined && <Text className="max-w-xl text-sm text-muted-foreground">{note}</Text>}
      {children}
    </div>
  )
}

async function uploadImage(_file: File): Promise<string> {
  await new Promise((resolve) => {
    setTimeout(resolve, 400)
  })

  return SAMPLE_IMAGE_URL
}
