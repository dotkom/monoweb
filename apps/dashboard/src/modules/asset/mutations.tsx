import { baseCreateMutationOpts, baseUpdateMutationOpts } from "../../utils/helpers"
import { trpc } from "../../utils/trpc"

export const useCreateImageAssetMutation = () => {
  return trpc.asset.createImageAsset.useMutation(baseCreateMutationOpts())
}

export const useCreateFileAssetMutation = () => {
  return trpc.asset.createFileAsset.useMutation(baseCreateMutationOpts())
}

export const useUpdateImageAssetMutation = () => {
  return trpc.asset.updateImageAsset.useMutation(baseUpdateMutationOpts())
}

export const useUpdateFileAssetMutation = () => {
  return trpc.asset.updateFileAsset.useMutation(baseUpdateMutationOpts())
}

export const useCreateImageVariantMutation = () => {
  return trpc.asset.createImageVariation.useMutation()
}

export const useUpdateImageVariantMutation = () => {
  return trpc.asset.updateImageVariation.useMutation()
}
