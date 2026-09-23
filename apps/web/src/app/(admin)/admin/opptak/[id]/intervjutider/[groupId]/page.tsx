"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { NoAccessNotice } from "@admin/components/NoAccessNotice"
import { useGroupAbbreviationMap } from "@admin/grupper/queries"
import { breadcrumbPath, useBreadcrumbLabel } from "@admin/lib/breadcrumb-context"
import { useAuthenticatedUser } from "@admin/lib/use-authenticated-user"
import { useSetInterviewAttendanceMutation } from "../../../mutations"
import { useApplicationPeriodGroupMatchingsQuery } from "../../../queries"
import type { CommitteeApplicationUnmatchedApplicant } from "@dotkomonline/rpc/committee-application"
import { DataTable, Title } from "@dotkomonline/ui"
import { getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useParams } from "next/navigation"
import { useCallback, useMemo } from "react"
import { useApplicationContext } from "../../provider"
import { MyInterviews } from "./components/MyInterviews"
import { InterviewCalendarHeader } from "./components/InterviewCalendarHeader"
import { InterviewCalendar } from "./components/InterviewCalendar"
import { unmatchedApplicantTable } from "./components/UnmatchedApplicantTable"

const NO_UNMATCHED_APPLICANTS: CommitteeApplicationUnmatchedApplicant[] = []

export default function ApplicationGroupInterviewsPage() {
  const { id, groupId } = useParams<{ id: string; groupId: string }>()
  const { application } = useApplicationContext()
  const { groupMatchings, isLoading } = useApplicationPeriodGroupMatchingsQuery(application.id)
  const { dbUser } = useAuthenticatedUser()
  const { isAdministrator, isApplicationGroupMember, canViewApplication } = useAuthorization()
  const { abbreviationBySlug } = useGroupAbbreviationMap()

  const groupMatching = groupMatchings.find((matching) => matching.applicationGroupId === groupId)
  const committeeName =
    groupMatching === undefined ? null : (abbreviationBySlug.get(groupMatching.groupId) ?? groupMatching.groupId)

  useBreadcrumbLabel(
    breadcrumbPath("opptak", id, "intervjutider", groupId),
    committeeName,
    breadcrumbPath("opptak", id, "intervjutider")
  )

  const { mutate: setInterviewAttendance } = useSetInterviewAttendanceMutation()

  const addedInterviews = useMemo(
    () =>
      groupMatching?.matchedInterviews.filter((interview) =>
        interview.attendees.some((attendee) => attendee.userId === dbUser?.id)
      ) ?? [],
    [groupMatching, dbUser]
  )

  const addedInterviewIds = useMemo(
    () => new Set(addedInterviews.map((interview) => interview.applicationId)),
    [addedInterviews]
  )

  const addInterview = useCallback(
    (applicationId: string) => {
      setInterviewAttendance({ applicationId, applicationGroupId: groupId, isAttending: true })
    },
    [setInterviewAttendance, groupId]
  )

  const removeInterview = useCallback(
    (applicationId: string) => {
      setInterviewAttendance({ applicationId, applicationGroupId: groupId, isAttending: false })
    },
    [setInterviewAttendance, groupId]
  )

  const unmatchedApplicants = groupMatching?.unmatchedApplicants ?? NO_UNMATCHED_APPLICANTS

  const unmatchedTable = useReactTable({
    ...unmatchedApplicantTable,
    data: unmatchedApplicants,
    getCoreRowModel: getCoreRowModel(),
  })

  if (!canViewApplication()) {
    return <NoAccessNotice />
  }

  if (isLoading) {
    return null
  }

  if (application.interviewsPublishedAt === null) {
    return <NoAccessNotice />
  }

  if (groupMatching === undefined || committeeName === null) {
    return <NoAccessNotice />
  }

  const canAttend = !isAdministrator && isApplicationGroupMember(groupMatching.groupId)

  return (
    <div className="flex flex-col gap-4">
      <Title element="h2" className="text-2xl">
        Intervjutider for {committeeName}
      </Title>

      {unmatchedApplicants.length > 0 && (
        <div className="flex flex-col gap-2">
          <Title element="h3" className="text-lg">
            Søkere uten intervju
          </Title>
          <DataTable table={unmatchedTable} />
        </div>
      )}

      <InterviewCalendarHeader canAttend={canAttend} />

      {canAttend && (
        <MyInterviews interviews={addedInterviews} canAttend={canAttend} onRemoveInterview={removeInterview} />
      )}

      <InterviewCalendar
        initialDate={application.interviewsStartDate}
        interviews={groupMatching.matchedInterviews}
        addedInterviewIds={addedInterviewIds}
        canAttend={canAttend}
        onAddInterview={addInterview}
        onRemoveInterview={removeInterview}
      />
    </div>
  )
}
