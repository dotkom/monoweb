import type { FC } from "react"
import { PunishmentTable } from "../../punishment/punishment-table"
import { usePunishmentAllInfiniteQuery } from "../../punishment/queries/use-punishment-all-query"
import { useUserDetailsContext } from "./provider"

export const UserPunishmentPage: FC = () => {
  const { user } = useUserDetailsContext()

  const { marks, fetchNextPage } = usePunishmentAllInfiniteQuery({
    byGivenToUserId: [user.id],
  })

  return <PunishmentTable marks={marks} onLoadMore={fetchNextPage} />
}
