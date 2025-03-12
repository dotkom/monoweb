// Expected response: 204 No Content
export async function uploadFileToS3PresignedUrl(
  file: File,
  fields: Record<string, string>,
  url: string
): Promise<string> {
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

    // S3 returns a Location header with the url of the uploaded file
    const location = response.headers.get("Location")
    if (!location) {
      throw new Error("File upload failed: No location header")
    }

    return location
  } catch (e) {
    throw new Error(`File upload failed: ${e}`)
  }
}
