import { trpc } from "../../utils/trpc"

export const useFileAssetsAllQuery = () => {
  const { data: fileAssets = [], ...query } = trpc.asset.getAllFileAssets.useQuery()
  return { fileAssets, ...query }
}

export const useImageAssetsAllQuery = () => {
  const { data: imageAssets = [], ...query } = trpc.asset.getAllImageAssets.useQuery()
  return { imageAssets, ...query }
}
