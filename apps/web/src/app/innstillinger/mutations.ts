import { env } from "@/env"
import { useTRPC } from "@/utils/trpc/client"
import { uploadFileToS3PresignedPost } from "@dotkomonline/utils"
import { useMutation } from "@tanstack/react-query"

/**
 * Create a presigned S3 URL for uploading user-related files, namely user avatar images.
 */
export const useUserFileUploadMutation = () => {
  const trpc = useTRPC()

  const createFileUploadMutation = useMutation(trpc.user.createFileUpload.mutationOptions())

  return async (file: File) => {
    const presignedPost = await createFileUploadMutation.mutateAsync({
      filename: file.name,
      contentType: file.type,
    })

    return await uploadFileToS3PresignedPost(env.AWS_CLOUDFRONT_URL, presignedPost, file)
  }
}
