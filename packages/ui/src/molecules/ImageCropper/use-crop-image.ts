"use client"

import { compressImage, type CompressImageError } from "@dotkomonline/utils/compress-image"
import { useEffect, useState } from "react"
import { createDownscaledObjectUrl } from "./create-downscaled-object-url"
import { cropImageToFile, type CropImageMimeType, type CropOutputSize } from "./crop-image-to-file"
import type { ImageCropperArea } from "./ImageCropper"

export type { CropOutputSize } from "./crop-image-to-file"

export type CropImageError = CompressImageError | "EXPORT_FAILED" | "NOT_READY"

export type CropImageOpenResult =
  | { success: true; needsCrop: true }
  | { success: true; needsCrop: false; file: File }
  | { success: false; error: CropImageError }

export type CropImageConfirmResult = { success: true; file: File } | { success: false; error: CropImageError }

export type UseCropImageOptions = {
  outputSize: CropOutputSize
  maxExportKiB: number
  mimeType?: CropImageMimeType
}

type Source = {
  file: File
  previewUrl: string
  mimeType: CropImageMimeType
}

const EMPTY_PERCENT_CROP: ImageCropperArea = { x: 0, y: 0, width: 0, height: 0 }
// Arbitrary minimum size for the preview image to keep it high-quality during cropping.
const MIN_PREVIEW_SIZE = 1024

function mimeTypeFromFile(file: File): CropImageMimeType {
  switch (file.type) {
    case "image/png":
      return "image/png"
    case "image/webp":
      return "image/webp"
    default:
      return "image/jpeg"
  }
}

/**
 * Crops and compresses an image.
 * GIFs are not cropped or compressed and are exported as-is to preserve animation.
 *
 * @param outputSize Max width/height of the exported crop.
 * @param maxExportKiB Max file size (KiB) after compression.
 * @param mimeType Optional output mime type; defaults from the source file.
 *
 * @example
 * ```tsx
 * const crop = useCropImage({
 *   outputSize: { maxWidth: 512, maxHeight: 512 },
 *   maxExportKiB: 256,
 * })
 *
 * // * Obtain a file to crop *
 *
 * const prepared = await crop.prepare(file)
 * if (!prepared.success) {
 *   // * handle prepared.error *
 *   return
 * }
 *
 * if (!prepared.needsCrop) {
 *   // * use prepared.file directly *
 *   return
 * }
 *
 * // * Render ImageCropper with crop.previewUrl and crop.onCropChange *
 * // * Wait until the user has finished cropping *
 *
 * const exported = await crop.exportCrop()
 * if (exported.success) {
 *   // * use exported.file *
 * }
 * ```
 */
export function useCropImage({ outputSize, maxExportKiB, mimeType }: UseCropImageOptions) {
  const [source, setSource] = useState<Source | null>(null)
  const [percentCrop, setPercentCrop] = useState<ImageCropperArea>(EMPTY_PERCENT_CROP)
  const [isPreparing, setIsPreparing] = useState(false)

  const previewUrl = source === null ? null : source.previewUrl
  const isCropReady = percentCrop.width > 0 && percentCrop.height > 0
  const maxWidthOrHeight = Math.max(outputSize.maxWidth, outputSize.maxHeight)

  useEffect(() => {
    return () => {
      if (source !== null) {
        URL.revokeObjectURL(source.previewUrl)
      }
    }
  }, [source])

  const reset = () => {
    setSource(null)
    setPercentCrop(EMPTY_PERCENT_CROP)
    setIsPreparing(false)
  }

  /**
   * @param croppedArea The cropped area in percent of the media.
   * @param _croppedAreaPixels The cropped area in pixels.
   */
  const onCropChange = (croppedArea: ImageCropperArea, _croppedAreaPixels: ImageCropperArea) => {
    setPercentCrop(croppedArea)
  }

  const prepare = async (file: File): Promise<CropImageOpenResult> => {
    reset()

    // We don't crop or compress GIFs as they would lose their animation
    if (file.type === "image/gif") {
      if (file.size > maxExportKiB * 1024) {
        return { success: false, error: "FILE_TOO_LARGE" }
      }

      return { success: true, needsCrop: false, file }
    }

    const nextMimeType = mimeType ?? mimeTypeFromFile(file)
    setIsPreparing(true)

    // Downscale the image to a reasonable size for the cropper preview.
    // Only used for the UI; exports use the original file.
    const previewMaxWidthOrHeight = Math.max(MIN_PREVIEW_SIZE, Math.min(outputSize.maxWidth, outputSize.maxHeight))
    const downscaled = await createDownscaledObjectUrl(file, nextMimeType, previewMaxWidthOrHeight)

    setIsPreparing(false)

    if (!downscaled.success) {
      return downscaled
    }

    setSource({ file, previewUrl: downscaled.url, mimeType: nextMimeType })

    return { success: true, needsCrop: true }
  }

  const exportCrop = async (): Promise<CropImageConfirmResult> => {
    if (source === null || !isCropReady) {
      return { success: false, error: "NOT_READY" }
    }

    const sourceUrl = URL.createObjectURL(source.file)
    try {
      const cropped = await cropImageToFile(sourceUrl, percentCrop, {
        outputSize,
        mimeType: source.mimeType,
        sourceFileName: source.file.name,
      })

      if (!cropped.success) {
        return cropped
      }

      return compressImage(cropped.file, {
        maxSizeKiB: maxExportKiB,
        maxWidthOrHeight,
      })
    } finally {
      URL.revokeObjectURL(sourceUrl)
    }
  }

  return {
    previewUrl,
    isPreparing,
    isCropReady,
    prepare,
    exportCrop,
    reset,
    onCropChange,
  }
}
