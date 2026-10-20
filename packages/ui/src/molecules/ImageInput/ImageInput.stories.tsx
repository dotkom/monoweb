import { useState, type ReactNode } from "react"
import { Text } from "../../atoms/Typography/Text"
import { ImageInput, type AspectRatio } from "./ImageInput"

const SAMPLE_IMAGE_URL = "https://picsum.photos/id/1018/1920/1080"

const CARD_ASPECT_RATIO: AspectRatio = { width: 16, height: 9 }
const EVENT_PAGE_ASPECT_RATIO: AspectRatio = { width: 24, height: 9 }

export default {
  title: "ImageInput",
}

export const Empty = () => {
  return (
    <InputStory>
      <ImageInputDemo />
    </InputStory>
  )
}

export const Cropping = () => {
  return (
    <InputStory note="Drop an image to open the 16:9 cropper.">
      <ImageInputDemo aspectRatio={CARD_ASPECT_RATIO} />
    </InputStory>
  )
}

export const DualAspectRatio = () => {
  return (
    <InputStory note="Drop an image. The crop is 24:9, and the white frame shows a 16:9 area overlay.">
      <ImageInputDemo
        aspectRatio={EVENT_PAGE_ASPECT_RATIO}
        overlayAspectRatio={CARD_ASPECT_RATIO}
        cropLegend="Hold hovedmotivet innenfor hvit ramme (16:9)."
      />
    </InputStory>
  )
}

export const CompressOnly = () => {
  return (
    <InputStory note="Drop an image. With no aspect ratio, saving compresses the file and keeps the full frame.">
      <ImageInputDemo />
    </InputStory>
  )
}

export const ExistingImage = () => {
  return (
    <InputStory note="A saved URL. Use “Bytt bilde” to pick a different file or URL.">
      <ImageInputDemo initialValue={SAMPLE_IMAGE_URL} />
    </InputStory>
  )
}

export const WithError = () => {
  return (
    <InputStory note="A validation message from the parent form. The picker stays usable.">
      <ImageInputDemo error="Bildet er påkrevd." />
    </InputStory>
  )
}

export const Disabled = () => {
  return (
    <InputStory note="Dropping, pasting, and the URL field are blocked.">
      <ImageInputDemo isDisabled />
    </InputStory>
  )
}

function ImageInputDemo({
  initialValue = "",
  aspectRatio,
  overlayAspectRatio,
  cropLegend,
  error,
  isDisabled = false,
}: {
  initialValue?: string
  aspectRatio?: AspectRatio
  overlayAspectRatio?: AspectRatio
  cropLegend?: string
  error?: string
  isDisabled?: boolean
}) {
  const [value, setValue] = useState(initialValue)

  return (
    <ImageInput
      className="max-w-2xl"
      label="Bilde"
      value={value}
      onChange={setValue}
      onFileUpload={uploadImage}
      maxSizeKiB={5 * 1024}
      aspectRatio={aspectRatio}
      overlayAspectRatio={overlayAspectRatio}
      cropLegend={cropLegend}
      error={error}
      disabled={isDisabled}
    />
  )
}

function InputStory({ note, children }: { note?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <Text className="max-w-2xl text-sm text-muted-foreground">{note}</Text>
      {children}
    </div>
  )
}

async function uploadImage(file: File): Promise<string> {
  await new Promise((resolve) => {
    setTimeout(resolve, 400)
  })

  return URL.createObjectURL(file)
}
