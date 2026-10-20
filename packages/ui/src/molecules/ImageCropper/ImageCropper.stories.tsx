import type { ReactNode } from "react"
import { Text } from "../../atoms/Typography/Text"
import { ImageCropper } from "./ImageCropper"

const SAMPLE_IMAGE_URL = "https://picsum.photos/id/1018/1920/1080"

export default {
  title: "ImageCropper",
}

export const SingleAspectRatio = () => {
  return (
    <CropperStory>
      <div className="relative h-96 w-full max-w-3xl">
        <ImageCropper
          objectUrl={SAMPLE_IMAGE_URL}
          aspectRatio={{ width: 16, height: 9 }}
          shape="rect"
          onChange={() => {}}
        />
      </div>
    </CropperStory>
  )
}

export const DualAspectRatio = () => {
  return (
    <CropperStory note="Crops the image using a 24:9 aspect ratio, and overlays a 16:9 aspect ratio.">
      <div className="relative h-96 w-full max-w-3xl">
        <ImageCropper
          objectUrl={SAMPLE_IMAGE_URL}
          aspectRatio={{ width: 24, height: 9 }}
          overlayAspectRatio={{ width: 16, height: 9 }}
          shape="rect"
          showGrid={false}
          onChange={() => {}}
        />
      </div>
    </CropperStory>
  )
}

export const Round = () => {
  return (
    <CropperStory>
      <div className="relative size-96">
        <ImageCropper
          objectUrl={SAMPLE_IMAGE_URL}
          aspectRatio={{ width: 1, height: 1 }}
          shape="round"
          onChange={() => {}}
        />
      </div>
    </CropperStory>
  )
}

export const Disabled = () => {
  return (
    <CropperStory>
      <div className="relative h-96 w-full max-w-3xl">
        <ImageCropper
          objectUrl={SAMPLE_IMAGE_URL}
          aspectRatio={{ width: 16, height: 9 }}
          shape="rect"
          disabled
          onChange={() => {}}
        />
      </div>
    </CropperStory>
  )
}

export const Loading = () => {
  return (
    <CropperStory>
      <div className="relative h-96 w-full max-w-3xl">
        <ImageCropper objectUrl={null} aspectRatio={{ width: 16, height: 9 }} shape="rect" onChange={() => {}} />
      </div>
    </CropperStory>
  )
}

function CropperStory({ note, children }: { note?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      {note !== undefined && <Text className="max-w-3xl text-sm text-muted-foreground">{note}</Text>}
      {children}
    </div>
  )
}
