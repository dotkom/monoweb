export const uploadFileToS3 = async (fileBlob: File, fileName: string, mimeType: string) => {
  const body = {
    route: "presigned_post",
    key: fileName,
    mime_type: mimeType,
  }

  const resp = await fetch(`${import.meta.env.VITE_API_URL}/generate_presigned_post`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  const response = await resp.json()

  const presignedPost = response.data

  const url = await uploadFileToS3PresignedUrl(fileBlob, mimeType, presignedPost.fields, presignedPost.url)

  return url
}

async function uploadFileToS3PresignedUrl(
  fileBlob: File,
  mimeType: string,
  fields: Record<string, string>,
  url: string
): Promise<string> {
  try {
    const formData = new FormData()
    for (const [key, value] of Object.entries(fields)) {
      formData.append(key, value)
    }

    formData.append("Content-Type", mimeType)
    formData.append("file", fileBlob)

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    })

    for (const [key, value] of Object.entries(response.headers)) {
      console.log(key, value)
    }

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
