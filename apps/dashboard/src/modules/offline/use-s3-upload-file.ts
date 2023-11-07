import { s3UploadFile } from "../../utils/s3-upload-file"
import { trpc } from "../../utils/trpc"

export const useS3UploadFile = () => {
  const url = trpc.offline.getS3UploadLink.useMutation()

  return async (file: File) => {
    const stuffNeededToUpload = await url.mutateAsync({
      filename: `${file.name}`,
      mimeType: file.type,
    })
    const fileToStore = await s3UploadFile(file, stuffNeededToUpload.fields, stuffNeededToUpload.url)
    return fileToStore
  }
}
