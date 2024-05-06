"use client"

// https://codesandbox.io/p/sandbox/react-image-crop-demo-with-react-hooks-y831o?file=%2Fsrc%2FApp.tsx%3A183%2C1-185%2C1
import type React from "react"
import { useRef } from "react"

import type { PixelCrop } from "react-image-crop"
import { canvasPreview } from "./utils"

interface ShowPreviewProps {
  imgSrc: string
  completedCrop: PixelCrop | undefined
  imgRef: React.RefObject<HTMLImageElement>
  scale: number
  hidden?: boolean
}
export function CropPreview({ imgSrc, completedCrop, imgRef, scale, hidden }: ShowPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  function renderCanvasPreview() {
    if (!imgRef.current || !canvasRef.current) {
      return
    }

    const crop: PixelCrop = completedCrop || {
      x: 0,
      y: 0,
      width: imgRef.current?.width,
      height: imgRef.current.height,
      unit: "px",
    }

    canvasPreview(imgRef.current, canvasRef.current, crop, scale)
  }

  return (
    <div style={{ display: hidden ? "none" : "block" }}>
      <img src={imgSrc} alt="Crop" style={{ display: "none" }} ref={imgRef} onLoad={renderCanvasPreview} />
      <canvas
        ref={canvasRef}
        style={{
          border: "1px solid black",
          objectFit: "contain",
          width: 300,
        }}
      />
    </div>
  )
}