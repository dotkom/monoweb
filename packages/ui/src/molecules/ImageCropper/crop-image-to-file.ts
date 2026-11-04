import type { Area } from "react-easy-crop"

export type CropOutputSize = {
  maxWidth: number
  maxHeight: number
}

export type CropImageMimeType = "image/jpeg" | "image/png" | "image/webp"

export type CropImageResult =
  | {
      success: true
      file: File
    }
  | {
      success: false
      error: "EXPORT_FAILED"
    }

export type CropImageOptions = {
  outputSize: CropOutputSize
  mimeType: CropImageMimeType
  sourceFileName: string
}

function getMimeTypeExtension(mimeType: CropImageMimeType): string {
  switch (mimeType) {
    case "image/jpeg":
      return ".jpg"
    case "image/png":
      return ".png"
    case "image/webp":
      return ".webp"
  }
}

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = url
  })
}

function percentCropToPixelCrop(percentCrop: Area, naturalWidth: number, naturalHeight: number): Area {
  const width = Math.min(naturalWidth, Math.round((percentCrop.width * naturalWidth) / 100))
  const height = Math.min(naturalHeight, Math.round((percentCrop.height * naturalHeight) / 100))
  const x = Math.min(Math.max(0, naturalWidth - width), Math.round((percentCrop.x * naturalWidth) / 100))
  const y = Math.min(Math.max(0, naturalHeight - height), Math.round((percentCrop.y * naturalHeight) / 100))

  return { x, y, width, height }
}

export async function cropImageToFile(
  imageUrl: string,
  percentCrop: Area,
  options: CropImageOptions
): Promise<CropImageResult> {
  const { outputSize, mimeType, sourceFileName } = options

  if (percentCrop.width <= 0 || percentCrop.height <= 0) {
    return { success: false, error: "EXPORT_FAILED" }
  }

  const image = await loadImage(imageUrl)
  if (image === null) {
    return { success: false, error: "EXPORT_FAILED" }
  }

  const pixelCrop = percentCropToPixelCrop(percentCrop, image.naturalWidth, image.naturalHeight)
  if (pixelCrop.width <= 0 || pixelCrop.height <= 0) {
    return { success: false, error: "EXPORT_FAILED" }
  }

  const scale = Math.min(1, outputSize.maxWidth / pixelCrop.width, outputSize.maxHeight / pixelCrop.height)

  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, Math.round(pixelCrop.width * scale))
  canvas.height = Math.max(1, Math.round(pixelCrop.height * scale))

  const context = canvas.getContext("2d")
  if (context === null) {
    return { success: false, error: "EXPORT_FAILED" }
  }

  context.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height
  )

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, mimeType, 1)
  })
  if (blob === null) {
    return { success: false, error: "EXPORT_FAILED" }
  }

  const fileName = buildCroppedFileName(sourceFileName, mimeType)

  return {
    success: true,
    file: new File([blob], fileName, { type: mimeType }),
  }
}

function buildCroppedFileName(originalName: string, mimeType: CropImageMimeType): string {
  // Remove the extension from the original name.
  const base = originalName.replace(/\.[^/.]+$/, "") || "image"

  return `${base}-cropped${getMimeTypeExtension(mimeType)}`
}
