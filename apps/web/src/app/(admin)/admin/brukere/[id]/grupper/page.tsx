"use client"

import { GroupTable } from "@dashboard/app/grupper/components/GroupTable"
import { Title } from "@dotkomonline/ui"
import { useAllMembershipsByUserIdQuery, useGroupAllByMemberQuery } from "../../queries"
import { useUserDetailsContext } from "../provider"

export default function UserGroupsPage() {
  const { user } = useUserDetailsContext()
  const { groups, isLoading } = useGroupAllByMemberQuery(user.id)
  const { memberships } = useAllMembershipsByUserIdQuery(user.id)

  return (
    <div className="flex flex-col gap-4">
      <Title element="h2" className="text-2xl font-semibold">
        Grupper
      </Title>
      <GroupTable groups={groups} isLoading={isLoading} userGroupMemberships={memberships} />
    </div>
  )
}
