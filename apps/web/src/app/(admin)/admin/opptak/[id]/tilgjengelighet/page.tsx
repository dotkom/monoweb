"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { NoAccessNotice } from "@admin/components/NoAccessNotice"
import { CommitteeTable } from "../../components/CommitteeTable"
import { useApplicationPeriodGroupsQuery } from "../../queries"
import { useApplicationContext } from "../provider"
import { availabilityTable } from "./[groupId]/components/AvailabilityTable"

export default function ApplicationStatusPage() {
  const { application } = useApplicationContext()
  const { applicationGroups, isLoading } = useApplicationPeriodGroupsQuery(application.id)
  const { canManageApplicationInterviews } = useAuthorization()

  if (!canManageApplicationInterviews()) {
    return <NoAccessNotice />
  }

  return (
    <div className="flex flex-col gap-4">
      <CommitteeTable {...availabilityTable} rows={applicationGroups} isLoading={isLoading} />
    </div>
  )
}
