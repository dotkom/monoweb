"use client"

import { Title } from "@dotkomonline/ui"
import { useGroupMembersAllQuery } from "../../../grupper/queries"
import { useSidequestRegistrationsQuery } from "../../queries"
import { SidequestRegistrationTable } from "../components/SidequestRegistrationTable"
import { useSidequestDetailsContext } from "../provider"

export default function SidequestRegistrationsPage() {
  const { sidequest } = useSidequestDetailsContext()
  const registrationsQuery = useSidequestRegistrationsQuery(sidequest.id)
  const membersQuery = useGroupMembersAllQuery(sidequest.interestGroupId)

  return (
    <div className="flex flex-col gap-4">
      <Title element="h2" size="sm">
        Påmeldte
      </Title>
      <SidequestRegistrationTable
        registrations={registrationsQuery.data ?? []}
        members={membersQuery.members ?? new Map()}
        interestGroupId={sidequest.interestGroupId}
        isLoading={registrationsQuery.isLoading || membersQuery.isLoading}
      />
    </div>
  )
}
