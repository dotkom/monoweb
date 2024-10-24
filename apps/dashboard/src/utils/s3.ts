import { env } from "@dotkomonline/env"
import type { ImageVariant } from "@dotkomonline/types"
import type { File } from "../../stubs/file/File"

// Expected response: 204 No Content. Returns resource URL if successful.
export async function s3UploadFile(file: File, fields: Record<string, string>, url: string) {
  try {
    const formData = new FormData()
    for (const [key, value] of Object.entries(fields)) {
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
  return `https://${env.NEXT_PUBLIC_STATIC_ASSETS_BUCKET}/testing/${key}`
}

function buildFinalCloudflareUrl(options: string, assetUrl: string) {
  const cloudflareImagesBaseUrl = "https://onli.no/cdn-cgi/image"

  return `${cloudflareImagesBaseUrl}/${options}/${assetUrl}`
}

type Size = { w?: number; h?: number }
export function buildImgUrl(image: ImageVariant, size?: Size) {
  const assetUrl = buildAssetUrl(image.asset.key)

  const options: string[] = []

  const addOpt = (key: string, value: string) => options.push(`${key}=${value}`)

  addOpt("scale", "fit-down") // https://developers.cloudflare.com/images/transform-images/transform-via-url/#recommended-image-sizes

  if (image.crop) {
    addOpt("trim.width", image.crop.width.toString())
    addOpt("trim.height", image.crop.height.toString())
    addOpt("trim.left", image.crop.left.toString())
    addOpt("trim.top", image.crop.top.toString())
  }

  if (size?.w) {
    addOpt("width", size.w.toString())
  }

  if (size?.h) {
    addOpt("height", size.h.toString())
  }

  if (!size?.h && !size?.w) {
    addOpt("width", "1920")
  }

  const optionsString = options.join(",")

  return buildFinalCloudflareUrl(optionsString, assetUrl)
}
