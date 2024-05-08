import { trpc } from "../../utils/trpc"
import { useS3UploadFile } from "../offline/use-s3-upload-file"

export const useUploadFileAssetToS3 = () => {
  const upload = useS3UploadFile()
  const createFileAsset = trpc.asset.createFileAsset.useMutation()

  return async (file: File) => {
    const result = await upload(file)

    return createFileAsset.mutateAsync({
      originalFilename: result.originalFilename,
      size: result.size,
      key: result.s3FileName,
      mimeType: result.mimeType,
    })
  }
}

interface ImageArgs {
  width: number
  height: number
  altText: string
}
export const useUploadImageAssetToS3 = () => {
  const upload = useS3UploadFile()
  const createImageAsset = trpc.asset.createImageAsset.useMutation()

  return async (file: File, imageArgs: ImageArgs) => {
    const result = await upload(file)

    return createImageAsset.mutateAsync({
      originalFilename: result.originalFilename,
      size: result.size,
      key: result.s3FileName,
      width: imageArgs.width,
      height: imageArgs.height,
      altText: imageArgs.altText,
      mimeType: result.mimeType,
    })
  }
}

export const useCreateImageVariantMutation = () => {
  return trpc.asset.createImageVariation.useMutation()
}

export const useUpdateImageVariantMutation = () => {
  return trpc.asset.updateImageVariation.useMutation()
}
