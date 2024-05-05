import type { Image } from "@dotkomonline/types"
import type { File } from "../../stubs/file/File"

// Expected response: 204 No Content. Returns resource URL if successful.
export async function s3UploadFile(file: File, fields: Record<string, string>, url: string) {
  try {
    const formData = new FormData()
    for (const [key, value] of Object.entries(fields)) {
      console.log(key, value)
      formData.append(key, value)
    }

    // Append the file to the formData
    formData.append("file", file)

    const response = await fetch(url, {
      method: "POST",
      body: formData, // No headers needed, fetch adds the correct one for FormData
    })

    // check for 204 No Content
    if (response.status !== 204) {
      throw new Error(`File upload failed: ${response.statusText}`)
    }
  } catch (e) {
    throw new Error(`File upload failed: ${e}`)
  }
}

export function buildAssetUrl(key: string) {
  return `https://s3.eu-north-1.amazonaws.com/cdn.staging.online.ntnu.no/testing/${key}`
}

type Size = { w?: number; h?: number }
export function buildImgUrl(image: Image, size?: Size) {
  // https://onli.no/cdn-cgi/image/trim.width=669,trim.height=373,trim.left=66,trim.top=495/https://s3.eu-north-1.amazonaws.com/cdn.staging.online.ntnu.no/testing/7e088b60-8f42-4958-a42d-077102a6eee0hei.pngdfaa2eea-63a4-4858-9b5b-326c4f4bf50b
  const cloudflareImagesBaseUrl = "https://onli.no/cdn-cgi/image"

  let options = ""

  const addOpt = (acc: string, key: string, value: string) => `${acc},${key}=${value}`

  addOpt(options, "scale", "fit-down") // https://developers.cloudflare.com/images/transform-images/transform-via-url/#recommended-image-sizes

  if (!size?.h && !size?.w) {
    return addOpt(options, "width", "1920")
  }

  if (size?.w) {
    options = addOpt(options, "width", size.w.toString())
  }

  if (size?.h) {
    options = addOpt(options, "height", size.h.toString())
  }

  if (image.crop) {
    options = addOpt(options, "trim.width", image.crop.width.toString())
    options = addOpt(options, "trim.height", image.crop.height.toString())
    options = addOpt(options, "trim.left", image.crop.left.toString())
    options = addOpt(options, "trim.top", image.crop.top.toString())
  }

  const assetUrl = buildAssetUrl(image.id)
  return `${cloudflareImagesBaseUrl}/${options}/${assetUrl}`
}
