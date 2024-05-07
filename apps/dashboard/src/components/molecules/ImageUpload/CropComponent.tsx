"use client"

// https://codesandbox.io/p/sandbox/react-image-crop-demo-with-react-hooks-y831o?file=%2Fsrc%2FApp.tsx%3A183%2C1-185%2C1
import type React from "react"
import { useRef, useState } from "react"

import ReactCrop, { centerCrop, makeAspectCrop, type PercentCrop, type Crop } from "react-image-crop"

import "react-image-crop/dist/ReactCrop.css"

// This is to demonstate how to make and center a % aspect crop
// which is a bit trickier so we use some helper functions.
function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  )
}
interface CropProps {
  imgSrc: string
  completedCrop?: Crop
  setCompletedCrop: (crop: PercentCrop) => void
  aspect?: number
  scale: number
}

export function CropComponent({ imgSrc, completedCrop, setCompletedCrop, aspect, scale }: CropProps) {
  const [crop, setCrop] = useState<Crop | undefined>(completedCrop ?? undefined)
  const imgRef = useRef<HTMLImageElement>(null)

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect && !completedCrop) {
      const { width, height } = e.currentTarget
      setCrop(centerAspectCrop(width, height, aspect))
    }
  }

  return (
    <ReactCrop
      crop={crop}
      onChange={(_, percentCrop) => {
        setCrop(percentCrop)
      }}
      onComplete={(_, p) => {
        setCompletedCrop(p)
      }}
      aspect={aspect}
      minHeight={100}
    >
      <img
        ref={imgRef}
        alt="Crop me"
        src={imgSrc}
        style={{ transform: `scale(${scale})`, maxWidth: "100%" }}
        onLoad={onImageLoad}
      />
    </ReactCrop>
  )
}
