import type { FC } from "react"
import { PunishmentTable } from "@/app/(internal)/prikker/punishment-table"
import { usePunishmentAllInfiniteQuery } from "@/app/(internal)/prikker/queries/use-punishment-all-query"
import { useUserDetailsContext } from "./provider"

export const UserPunishmentPage: FC = () => {
  const { user } = useUserDetailsContext()

  const { marks, fetchNextPage } = usePunishmentAllInfiniteQuery({
    byGivenToUserId: [user.id],
  })

  return <PunishmentTable marks={marks} onLoadMore={fetchNextPage} />
}
