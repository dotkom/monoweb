import { notifications } from "@mantine/notifications"
import { useMutation } from "@tanstack/react-query"
import { env } from "../../env"
import { uploadFileToS3PresignedUrl } from "../../s3"
import { useTRPC } from "../../trpc"

const TEST_MODE_IMG_URL = "https://s3.eu-north-1.amazonaws.com/cdn.online.ntnu.no/img1.jpeg"

export const useS3UploadFile = () => {
  const trpc = useTRPC()
  const presignedPostMut = useMutation(trpc.offline.createPresignedPost.mutationOptions())

  return async (file: File) => {
    if (env.S3_UPLOAD_ENABLED === "true") {
      const presignedPost = await presignedPostMut.mutateAsync({
        filename: `${file.name}`,
        mimeType: file.type,
      })
      return await uploadFileToS3PresignedUrl(file, presignedPost.fields, presignedPost.url)
    }

    notifications.show({
      title: "You're in test mode",
      message: "Returning url of already uploaded file. See S3_UPLOAD_ENABLED env variable to turn on S3 upload.",
    })
    return TEST_MODE_IMG_URL
  }
}
