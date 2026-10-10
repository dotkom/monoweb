"use client"

import { Title } from "@dotkomonline/ui"
import { useGroupMembersAllQuery } from "../../../grupper/queries"
import { useInterestGroupEventRegistrationsQuery } from "../../queries"
import { InterestGroupEventRegistrationTable } from "../components/InterestGroupEventRegistrationTable"
import { useInterestGroupEventDetailsContext } from "../provider"

export default function InterestGroupEventRegistrationsPage() {
  const { interestGroupEvent } = useInterestGroupEventDetailsContext()
  const registrationsQuery = useInterestGroupEventRegistrationsQuery(interestGroupEvent.id)
  const membersQuery = useGroupMembersAllQuery(interestGroupEvent.interestGroupId)

  return (
    <div className="flex flex-col gap-4">
      <Title element="h2" size="sm">
        Påmeldte
      </Title>
      <InterestGroupEventRegistrationTable
        registrations={registrationsQuery.data ?? []}
        members={membersQuery.members ?? new Map()}
        interestGroupId={interestGroupEvent.interestGroupId}
        isLoading={registrationsQuery.isLoading || membersQuery.isLoading}
      />
    </div>
  )
}
