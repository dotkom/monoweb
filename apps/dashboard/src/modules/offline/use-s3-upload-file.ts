import { type File } from "../../../stubs/file/File"
import { s3UploadFile } from "../../utils/s3-upload-file"
import { trpc } from "../../utils/trpc"

export const useS3UploadFile = () => {
  const presignedPostMut = trpc.offline.createPresignedPost.useMutation()

  return async (file: File) => {
    const presignedPost = await presignedPostMut.mutateAsync({
      filename: `${file.name}`,
      mimeType: file.type,
    })
    const fileToStore = await s3UploadFile(file, presignedPost.fields, presignedPost.url)
    return fileToStore
  }
}
