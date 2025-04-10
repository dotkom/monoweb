import imageCompression from "browser-image-compression"
import heic2any from "heic2any"

type CompressedFile = {
  blob: Blob | Blob[] | File
  downloadLink: string
}

// https://www.npmjs.com/package/browser-image-compression
export async function compressImageWithLibrary(
  file: File,
  maxSizeMB: number,
  onProgress?: (progress: number) => void
): Promise<CompressedFile> {
  let imageFile: Blob | Blob[] | File = file
  console.log("originalFile instanceof Blob", imageFile instanceof Blob) // true
  console.log(`originalFile size ${imageFile.size / 1024 / 1024} MB`)

  const options = {
    maxSizeMB,
    useWebWorker: true,
    onProgress: onProgress,
    fileType: "image/jpeg",
  }

  // console log download link
  console.log("downloadLink", URL.createObjectURL(imageFile))

  console.log(file.name)
  try {
    if (file.name.toUpperCase().endsWith(".HEIC") || file.name.endsWith(".HEIF")) {
      console.log("Converting HEIC/HEIF to JPEG...")
      imageFile = await heic2any({ blob: imageFile, toType: "image/jpeg" })
      console.log("Conversion completed:", file)
    }

    const compressedFile = await imageCompression(imageFile as File, options)
    console.log("compressedFile instanceof Blob", compressedFile instanceof Blob) // true
    console.log(`compressedFile size ${compressedFile.size / 1024 / 1024} MB`) // smaller than maxSizeMB

    // Create a download link for the compressed file
    const downloadLink = URL.createObjectURL(compressedFile)

    return {
      blob: compressedFile,
      downloadLink,
    }
  } catch (error) {
    console.log(error)
    throw error
  }
}
