import type { FC } from "react"
import { AllGroupsTable } from "../../group/all-groups-table"
import { useGroupAllByMemberQuery } from "../queries"
import { useUserDetailsContext } from "./provider"

export const UserGroupPage: FC = () => {
  const { user } = useUserDetailsContext()

  const groups = useGroupAllByMemberQuery(user.id)

  return <AllGroupsTable groups={groups} />
}
