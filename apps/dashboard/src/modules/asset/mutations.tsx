import { trpc } from "../../utils/trpc"
import { useS3UploadFile } from "../offline/use-s3-upload-file"

export const useCreateAssetMutation = () => {
  return trpc.asset.create.useMutation()
}

export const useUploadAssetToS3 = () => {
  const upload = useS3UploadFile()
  const createAsset = useCreateAssetMutation()

  return async (file: File) => {
    const result = await upload(file)
    const inserted = await createAsset.mutateAsync({
      metadata: null,
      originalFilename: result.originalFilename,
      size: result.size,
      key: result.s3FileName,
    })

    return inserted
  }
}

export const useCreateImageMutation = () => {
  return trpc.asset.createImage.useMutation({
    onSuccess(data, variables, context) {
    },
  })
}

export const useUpdateImageMutation = () => {
  return trpc.asset.updateImage.useMutation()
}

export const useCreateFileMutation = () => {
  return trpc.asset.createFile.useMutation()
}
