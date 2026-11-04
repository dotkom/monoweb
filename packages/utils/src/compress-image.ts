import imageCompression from "browser-image-compression"

interface CompressImageOptions {
  maxSizeKiB: number
  maxWidthOrHeight: number
}

export type CompressImageError = "FILE_TOO_LARGE" | "PROCESSING_ERROR"

type CompressImageResult =
  | {
      success: true
      file: File
    }
  | {
      success: false
      error: CompressImageError
    }

export async function compressImage(file: File, options: CompressImageOptions): Promise<CompressImageResult> {
  // We don't compress GIFs to preserve animation
  if (file.type === "image/gif") {
    if (file.size > options.maxSizeKiB * 1024) {
      return { success: false, error: "FILE_TOO_LARGE" }
    }

    return { success: true, file }
  }

  let compressed: File
  try {
    compressed = await imageCompression(file, {
      maxSizeMB: options.maxSizeKiB / 1024,
      maxWidthOrHeight: options.maxWidthOrHeight,
    })
  } catch {
    return { success: false, error: "PROCESSING_ERROR" }
  }

  if (compressed.size > options.maxSizeKiB * 1024) {
    return { success: false, error: "FILE_TOO_LARGE" }
  }

  return { success: true, file: compressed }
}
