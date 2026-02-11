import { useTRPC } from "@/utils/trpc/client"
import { useQuery } from "@tanstack/react-query"

export const useIsAdminQuery = () => {
  const trpc = useTRPC()
  const { data: isAdmin, isLoading } = useQuery(trpc.user.isAdmin.queryOptions())
  return { isAdmin, isLoading }
}
