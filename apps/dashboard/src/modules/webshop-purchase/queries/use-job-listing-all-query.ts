import { trpc } from "../../../utils/trpc"

export const useWebshopPurchaseAllQuery = () => {
  const { data: webshopPurchase = [], ...query } = trpc.webshopPurchase.all.useQuery({ take: 999 })
  return { webshopPurchase, ...query }
}
