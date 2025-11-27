import { env } from "@/lib/env"
import { useTRPC } from "@/lib/trpc-client"
import { uploadFileToS3PresignedPost } from "@dotkomonline/utils"
import { useMutation } from "@tanstack/react-query"

export const useOfflineFileUploadMutation = () => {
  const trpc = useTRPC()

  const createFileUploadMutation = useMutation(trpc.offline.createFileUpload.mutationOptions())

  return async (file: File) => {
    const presignedPost = await createFileUploadMutation.mutateAsync({
      filename: file.name,
      contentType: file.type,
    })

    return await uploadFileToS3PresignedPost(env.AWS_CLOUDFRONT_URL, presignedPost, file)
  }
}
