import { env } from "@/env"
import { useTRPC } from "@/utils/trpc/client"
import { uploadFileToS3PresignedPost } from "@dotkomonline/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"

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

export const useUserUpdateMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.user.update.mutationOptions({
      onSuccess: async (data) => {
        await Promise.allSettled([
          queryClient.invalidateQueries(trpc.user.getByUsername.queryOptions(data.username)),
          queryClient.invalidateQueries(trpc.user.findByUsername.queryOptions(data.username)),
          queryClient.invalidateQueries(trpc.user.getMe.queryOptions()),
          queryClient.invalidateQueries(trpc.user.findMe.queryOptions()),
        ])
      },
    })
  )
}
