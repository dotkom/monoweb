"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { useAuthenticatedUser } from "@admin/lib/use-authenticated-user"
import { CommitteeTable } from "../../components/CommitteeTable"
import { NoAccessNotice } from "@admin/components/NoAccessNotice"
import { useApplicationPeriodGroupMatchingsQuery } from "../../queries"
import { useMemo } from "react"
import { useApplicationContext } from "../provider"
import { createInterviewColumns, getInterviewHref, interviewTable } from "./[groupId]/components/InterviewTable"

export default function ApplicationInterviewsPage() {
  const { application } = useApplicationContext()
  const { groupMatchings, isLoading } = useApplicationPeriodGroupMatchingsQuery(application.id)
  const { isAdministrator } = useAuthorization()
  const { dbUser } = useAuthenticatedUser()

  const getHref = useMemo(() => getInterviewHref(application.id), [application.id])

  const columns = useMemo(
    () => createInterviewColumns(isAdministrator ? null : (dbUser?.id ?? null)),
    [isAdministrator, dbUser]
  )

  const isConfirmed = application.interviewsPublishedAt !== null

  if (!isConfirmed && !isLoading) {
    return <NoAccessNotice />
  }

  return (
    <div className="flex flex-col gap-4">
      <CommitteeTable
        {...interviewTable}
        columns={columns}
        getHref={getHref}
        rows={groupMatchings}
        isLoading={isLoading}
      />
    </div>
  )
}
