"use client"

import { IconLoader2 } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import Cropper, { type Area, type Point } from "react-easy-crop"
import { cn } from "../../utils"
import type { AspectRatio } from "../ImageInput/ImageInput"

export type ImageCropperArea = Area

export type ImageCropperShape = "rect" | "round"

export type ImageCropperProps = {
  objectUrl: string | null
  aspectRatio: AspectRatio
  shape: ImageCropperShape
  onChange: (croppedArea: Area, croppedAreaPixels: Area) => void
  disabled?: boolean
}

export function ImageCropper({ objectUrl, aspectRatio, shape, onChange, disabled = false }: ImageCropperProps) {
  const [isMediaReady, setIsMediaReady] = useState(false)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset the skeleton when the preview url changes
  useEffect(() => {
    setIsMediaReady(false)
  }, [objectUrl])

  const handleCropChange = (nextCrop: Point) => {
    if (disabled) {
      return
    }

    setCrop(nextCrop)
  }

  const handleZoomChange = (nextZoom: number) => {
    if (disabled) {
      return
    }

    setZoom(nextZoom)
  }

  return (
    <div className="relative h-full w-full">
      {(!isMediaReady || objectUrl === null) && (
        <>
          <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-stone-800" />
          <IconLoader2 className="absolute inset-0 z-10 m-auto size-16 text-gray-400 motion-safe:animate-spin motion-reduce:hidden dark:text-stone-600" />
        </>
      )}

      {objectUrl !== null && (
        <Cropper
          key={objectUrl}
          image={objectUrl}
          crop={crop}
          aspect={aspectRatio.width / aspectRatio.height}
          cropShape={shape}
          zoom={zoom}
          onCropChange={handleCropChange}
          onZoomChange={handleZoomChange}
          onCropComplete={onChange}
          onMediaLoaded={() => setIsMediaReady(true)}
          zoomWithScroll={!disabled}
          classes={{
            containerClassName: cn(!isMediaReady && "opacity-0"),
          }}
        />
      )}
      {disabled && <div className="absolute inset-0 z-10 cursor-default" />}
    </div>
  )
}
