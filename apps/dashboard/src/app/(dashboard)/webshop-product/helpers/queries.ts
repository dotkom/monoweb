import { trpc } from "../../../../utils/trpc"

export const useWebshopProductAllQuery = () => {
  const { data: webshopProduct = [], ...query } = trpc.webshopProduct.all.useQuery({ take: 999 })
  return { webshopProduct, ...query }
}
