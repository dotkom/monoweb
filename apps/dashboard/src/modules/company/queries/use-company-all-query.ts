import { useTRPC } from "../../../trpc"

import { useQuery } from "@tanstack/react-query"

export const useCompanyAllQuery = () => {
  const trpc = useTRPC()
  const { data: companies = [], ...query } = useQuery(trpc.company.all.queryOptions({ take: 999 }))
  return { companies, ...query }
}
