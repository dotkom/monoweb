"use client"

import { GroupTable } from "@/app/(internal)/grupper/components/GroupTable"
import { Title } from "@dotkomonline/ui"
import { useGroupAllByMemberQuery } from "../../queries"
import { useUserDetailsContext } from "../provider"

export default function UserGrupperPage() {
  const { user } = useUserDetailsContext()
  const { groups, isLoading } = useGroupAllByMemberQuery(user.id)

  return (
    <div className="flex flex-col gap-4">
      <Title element="h2" className="text-2xl font-semibold">
        Grupper
      </Title>
      <GroupTable groups={groups} isLoading={isLoading} />
    </div>
  )
}
