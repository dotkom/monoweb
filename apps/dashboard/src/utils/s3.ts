import { env } from "@dotkomonline/env"
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
  return `${env.NEXT_PUBLIC_S3_BUCKET_MONOWEB}/${key}`
}
