import { uploadFileToS3PresignedUrl } from "../../s3"
import { useTRPC } from "../../trpc"

import { useMutation } from "@tanstack/react-query"

export const useS3UploadFile = () => {
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
