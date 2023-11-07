// Expected response: 204 No Content. Returns resource URL if successful.
export async function s3UploadFile(file: File, fields: Record<string, string>, url: string): Promise<string> {
  try {
    console.log(file, fields, url)
    const formData = new FormData()
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value)
    })

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

    console.log(response)

    const resourceURL = response.headers.get("Location")

    if (resourceURL === null) {
      console.error("Full response headers:", [...response.headers.entries()])
      throw new Error("File upload failed: No resource URL returned")
    }

    return resourceURL
  } catch (e) {
    throw new Error(`File upload failed: ${e}`)
  }
}
