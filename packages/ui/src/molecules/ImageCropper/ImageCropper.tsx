"use client"

import { IconLoader2 } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import Cropper, { type Area, type Point, type Size } from "react-easy-crop"
import { cn } from "../../utils"
import type { AspectRatio } from "../ImageInput/ImageInput"
import { ImageAspectGuideOverlay } from "./ImageAspectGuideOverlay"

export type ImageCropperArea = Area

export type ImageCropperShape = "rect" | "round"

export type ImageCropperProps = {
  objectUrl: string | null
  aspectRatio: AspectRatio
  shape: ImageCropperShape
  onChange: (croppedArea: Area, croppedAreaPixels: Area) => void
  disabled?: boolean
  className?: string
  showGrid?: boolean
  overlayAspectRatio?: AspectRatio
}

export function ImageCropper({
  objectUrl,
  aspectRatio,
  shape,
  onChange,
  disabled = false,
  className,
  showGrid = true,
  overlayAspectRatio,
}: ImageCropperProps) {
  const [isMediaReady, setIsMediaReady] = useState(false)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [cropSize, setCropSize] = useState<Size>({ width: 0, height: 0 })

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
    <div className={cn("relative h-full w-full overflow-hidden bg-white dark:bg-stone-700", className)}>
      {(!isMediaReady || objectUrl === null) && (
        <>
          <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-stone-800" />
          <IconLoader2 className="absolute inset-0 z-10 m-auto size-16 text-gray-400 motion-safe:animate-spin motion-reduce:hidden dark:text-stone-600" />
        </>
      )}

      {objectUrl !== null && (
        <>
          {overlayAspectRatio !== undefined && cropSize.width > 0 && cropSize.height > 0 && (
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 z-10 translate-x-[-50%] translate-y-[-50%]"
              style={{ width: cropSize.width, height: cropSize.height }}
            >
              <ImageAspectGuideOverlay outerAspectRatio={aspectRatio} innerAspectRatio={overlayAspectRatio} />
            </div>
          )}

          <Cropper
            key={objectUrl}
            image={objectUrl}
            crop={crop}
            aspect={aspectRatio.width / aspectRatio.height}
            onCropSizeChange={setCropSize}
            cropShape={shape}
            zoom={zoom}
            onCropChange={handleCropChange}
            onZoomChange={handleZoomChange}
            onCropComplete={onChange}
            onMediaLoaded={() => setIsMediaReady(true)}
            zoomWithScroll={!disabled}
            showGrid={showGrid}
            classes={{
              containerClassName: cn(!isMediaReady && "opacity-0"),
              cropAreaClassName: overlayAspectRatio !== undefined ? "border-0" : undefined,
            }}
            style={
              overlayAspectRatio !== undefined
                ? {
                    cropAreaStyle: {
                      border: "none",
                      // Makes the part of the image that is not within the provided aspect ratio dark
                      color: "rgba(0, 0, 0, 0.7)",
                    },
                  }
                : undefined
            }
          />
        </>
      )}

      {disabled && <div className="absolute inset-0 z-10 cursor-default" />}
    </div>
  )
}
