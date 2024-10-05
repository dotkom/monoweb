import { uploadFileToS3PresignedUrl } from "../../s3"
import { trpc } from "../../trpc"

export const useS3UploadFile = () => {
  const presignedPostMut = trpc.offline.createPresignedPost.useMutation()

  return async (file: File) => {
    const presignedPost = await presignedPostMut.mutateAsync({
      filename: `${file.name}`,
      mimeType: file.type,
    })
    return await uploadFileToS3PresignedUrl(file, presignedPost.fields, presignedPost.url)
  }
}
