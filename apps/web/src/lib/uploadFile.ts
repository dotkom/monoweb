import { useMutation } from "@tanstack/react-query"
import { useTRPC } from "../utils/trpc/client"
import { uploadFileToS3PresignedUrl } from "./s3"

export const useUploadFile = () => {
  const trpc = useTRPC()
  const presignedPostMut = useMutation(trpc.offline.createPresignedPost.mutationOptions())

  return async (file: File) => {
    const presignedPost = await presignedPostMut.mutateAsync({
      filename: `${file.name}`,
      mimeType: file.type,
    })

    return await uploadFileToS3PresignedUrl(file, presignedPost.fields, presignedPost.url)
  }
}
