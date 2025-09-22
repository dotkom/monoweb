import type { FC } from "react"
import { PunishmentTable } from "../../punishment/punishment-table"
import { useMarkAllQuery } from "../queries"
import { useUserDetailsContext } from "./provider"

export const UserPunishmentPage: FC = () => {
  const { user } = useUserDetailsContext()

  const marks = useMarkAllQuery({
    byGivenToUserId: [user.id],
  })

  return <PunishmentTable marks={marks} />
}
