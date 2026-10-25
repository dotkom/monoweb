import type { CropImageMimeType } from "./crop-image-to-file"

type CreateDownscaledObjectUrlResult =
  | {
      success: true
      url: string
    }
  | {
      success: false
      error: "PROCESSING_ERROR"
    }

// Arbitrary default quality to reduce file size for preview downscaling.
const DEFAULT_IMAGE_QUALITY = 0.92

export async function createDownscaledObjectUrl(
  file: File,
  mimeType: CropImageMimeType,
  maxWidthOrHeight: number,
  quality: number = DEFAULT_IMAGE_QUALITY
): Promise<CreateDownscaledObjectUrlResult> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return { success: false, error: "PROCESSING_ERROR" }
  }

  const largestWidthOrHeight = Math.max(bitmap.width, bitmap.height)
  if (largestWidthOrHeight <= maxWidthOrHeight) {
    bitmap.close()

    return { success: true, url: URL.createObjectURL(file) }
  }

  const scale = maxWidthOrHeight / largestWidthOrHeight
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  let resized: ImageBitmap | null = null
  try {
    resized = await createImageBitmap(file, {
      resizeWidth: width,
      resizeHeight: height,
      resizeQuality: "high",
    })
  } catch {
    bitmap.close()

    return { success: false, error: "PROCESSING_ERROR" }
  }

  try {
    const canvas = document.createElement("canvas")
    canvas.width = resized.width
    canvas.height = resized.height

    const context = canvas.getContext("2d")
    if (context === null) {
      return { success: false, error: "PROCESSING_ERROR" }
    }

    context.drawImage(resized, 0, 0)

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((result) => resolve(result), mimeType, quality)
    })

    if (blob === null) {
      return { success: false, error: "PROCESSING_ERROR" }
    }

    return { success: true, url: URL.createObjectURL(blob) }
  } finally {
    resized.close()
    bitmap.close()
  }
}
