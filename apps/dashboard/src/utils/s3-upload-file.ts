import type { StaticAssetWrite } from "@dotkomonline/types"
import type { File } from "../../stubs/file/File"

// Expected response: 204 No Content. Returns resource URL if successful.
export async function s3UploadFile(file: File, fields: Record<string, string>, url: string): Promise<StaticAssetWrite> {
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

    const resourceURL = response.headers.get("Location")

    if (resourceURL === null) {
      console.error("Full response headers:", [...response.headers.entries()])
      throw new Error("File upload failed: No resource URL returned")
    }

    return {
      url: resourceURL,
      createdAt: new Date(),
      fileName: file.name,
      fileType: file.type,
    }
  } catch (e) {
    throw new Error(`File upload failed: ${e}`)
  }
}
