import { trpc } from "../../utils/trpc"
import { useS3UploadFile } from "../offline/use-s3-upload-file"

type UploadArgs =
  | {
      type: "image"
      width: number
      height: number
      altText: string
    }
  | {
      type: "other"
    }

export const useUploadAssetToS3 = () => {
  const upload = useS3UploadFile()
  const createFileAsset = trpc.asset.createFileAsset.useMutation()
  const createImageAsset = trpc.asset.createImageAsset.useMutation()

  return async (file: File, arg: UploadArgs) => {
    const result = await upload(file)

    if (arg.type === "image") {
      return createImageAsset.mutateAsync({
        originalFilename: result.originalFilename,
        size: result.size,
        key: result.s3FileName,
        width: arg.width,
        height: arg.height,
        altText: arg.altText,
        mimeType: result.mimeType,
      })
    }

    return createFileAsset.mutateAsync({
      originalFilename: result.originalFilename,
      size: result.size,
      key: result.s3FileName,
      mimeType: result.mimeType,
    })
  }
}

export const useCreateImageMutation = () => {
  return trpc.asset.createImageVariation.useMutation()
}

export const useUpdateImageMutation = () => {
  return trpc.asset.updateImageVariation.useMutation()
}
