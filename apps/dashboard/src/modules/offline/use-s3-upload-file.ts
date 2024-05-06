import type { File } from "../../../stubs/file/File"
import { s3UploadFile } from "../../utils/s3"
import { trpc } from "../../utils/trpc"

export const useS3UploadFile = () => {
  const presignedPostMut = trpc.offline.createPresignedPost.useMutation()

  return async (file: File) => {
    const res = await presignedPostMut.mutateAsync({
      filename: file.name,
      mimeType: file.type,
    })

    await s3UploadFile(file, res.presignedUrl.fields, res.presignedUrl.url)

    return {
      s3FileName: res.s3Key,
      originalFilename: file.name,
      size: file.size,
    }
  }
}
