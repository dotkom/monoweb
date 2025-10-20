import { env } from "@/lib/env"
import { uploadFileToS3PresignedUrl } from "@/lib/s3"
import { useTRPC } from "@/lib/trpc-client"
import { createCloudFrontUrl } from "@dotkomonline/utils"
import { notifications } from "@mantine/notifications"
import { useMutation } from "@tanstack/react-query"

const TEST_MODE_IMG_URL = "https://cdn.online.ntnu.no/img1.jpeg"

export const useS3UploadFile = () => {
  const trpc = useTRPC()
  const presignedPostMut = useMutation(trpc.offline.createPresignedPost.mutationOptions())

  return async (file: File) => {
    if (env.S3_UPLOAD_ENABLED === "true") {
      const presignedPost = await presignedPostMut.mutateAsync({
        filename: `${file.name}`,
        mimeType: file.type,
      })
      await uploadFileToS3PresignedUrl(file, presignedPost.fields, presignedPost.url)

      return createCloudFrontUrl(env.AWS_CLOUDFRONT_URL, presignedPost.fields.key)
    }

    notifications.show({
      title: "You're in test mode",
      message: "Returning url of already uploaded file. See S3_UPLOAD_ENABLED env variable to turn on S3 upload.",
    })
    return TEST_MODE_IMG_URL
  }
}
