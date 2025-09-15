import { useMutation } from "@tanstack/react-query"
import { useTRPC } from "./utils/trpc/client"

/**
 * Manually upload a Web File to the given S3 presigned UTL.
 *
 * Parameters `fields` and `url` come from the presigned post response. See the `useCreateAvtarUploadURL` hook for an
 * example of how this function is expected to be used.
 */
async function uploadFileToS3PresignedUrl(file: File, fields: Record<string, string>, url: string): Promise<string> {
  if (!file.type?.startsWith("image/")) {
    throw new Error("File is not an image")
  }

  try {
    const formData = new FormData()
    for (const [key, value] of Object.entries(fields)) {
      formData.append(key, value)
    }
    formData.append("file", file)

    const response = await fetch(url, {
      method: "POST",
      body: formData,
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

/**
 * Create a presigned S3 URL for uploading the calling user's avatar image.
 *
 * NOTE: Do not use this function for anything non-avatar related. The options on the backend are specifically set for
 * avatar images.
 */
export const useCreateAvatarUploadURL = () => {
  const trpc = useTRPC()
  const presignedPostMut = useMutation(trpc.user.createAvatarUploadURL.mutationOptions())
  return async (file: File) => {
    const presignedPost = await presignedPostMut.mutateAsync()
    return await uploadFileToS3PresignedUrl(file, presignedPost.fields, presignedPost.url)
  }
}
