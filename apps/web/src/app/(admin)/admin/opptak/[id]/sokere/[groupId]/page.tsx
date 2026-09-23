"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { NoAccessNotice } from "@admin/components/NoAccessNotice"
import { useGroupAbbreviationMap } from "@admin/grupper/queries"
import { breadcrumbPath, useBreadcrumbLabel } from "@admin/lib/breadcrumb-context"
import { useApplicationPeriodGroupMatchingsQuery } from "../../../queries"
import { useParams } from "next/navigation"
import { useCallback, useMemo } from "react"
import { useApplicationContext } from "../../provider"
import { type ApplicantRow, ApplicantTable } from "./ApplicantTable"

export default function ApplicationGroupApplicantInfoPage() {
  const { id, groupId } = useParams<{ id: string; groupId: string }>()
  const { application } = useApplicationContext()
  const { groupMatchings, isLoading } = useApplicationPeriodGroupMatchingsQuery(application.id)
  const { abbreviationBySlug } = useGroupAbbreviationMap()
  const { canViewApplication } = useAuthorization()

  const groupMatching = groupMatchings.find((matching) => matching.applicationGroupId === groupId)
  const committeeName =
    groupMatching === undefined ? null : (abbreviationBySlug.get(groupMatching.groupId) ?? groupMatching.groupId)

  useBreadcrumbLabel(
    breadcrumbPath("opptak", id, "sokere", groupId),
    committeeName,
    breadcrumbPath("opptak", id, "sokere")
  )

  const applicants: ApplicantRow[] = useMemo(
    () => [
      ...(groupMatching?.matchedInterviews ?? []).map((interview) => ({
        applicationId: interview.applicationId,
        name: interview.name,
        interview,
      })),
      ...(groupMatching?.unmatchedApplicants ?? []).map((applicant) => ({
        applicationId: applicant.applicationId,
        name: applicant.name,
        interview: null,
      })),
    ],
    [groupMatching]
  )

  const getHref = useCallback(
    (applicant: ApplicantRow) => `/admin/opptak/${id}/sokere/${groupId}/${applicant.applicationId}`,
    [id, groupId]
  )

  if (!canViewApplication()) {
    return <NoAccessNotice />
  }

  if (isLoading) {
    return null
  }

  if (application.interviewsPublishedAt === null || groupMatching === undefined) {
    return <NoAccessNotice />
  }

  return (
    <div className="flex flex-col gap-4">
      <ApplicantTable rows={applicants} getHref={getHref} isLoading={isLoading} />
    </div>
  )
}
