"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { useGroupAbbreviationMap } from "@admin/grupper/queries"
import { NoAccessNotice } from "@admin/components/NoAccessNotice"
import { useApplicationPeriodGroupMatchingsQuery } from "../../queries"
import type { ApplicantInterview } from "../../components/Cells"
import { useCallback, useMemo } from "react"
import { useApplicationContext } from "../provider"
import { type ApplicantRow, ApplicantTable } from "./[groupId]/ApplicantTable"

interface ApplicantSelection {
  rank: number | null
  groupId: string
  applicationGroupId: string
  interview: ApplicantInterview | null
}

export default function ApplicationApplicantInfoPage() {
  const { application } = useApplicationContext()
  const { groupMatchings, isLoading } = useApplicationPeriodGroupMatchingsQuery(application.id)
  const { abbreviationBySlug } = useGroupAbbreviationMap()
  const { isAdministrator } = useAuthorization()

  const applicantsByApplicationId = useMemo(() => {
    const applicants = new Map<string, { applicant: ApplicantRow; selections: ApplicantSelection[] }>()

    for (const matching of groupMatchings) {
      const groupApplicants = [
        ...matching.matchedInterviews.map((interview) => ({ ...interview, interview })),
        ...matching.unmatchedApplicants.map((applicant) => ({ ...applicant, interview: null })),
      ]

      for (const groupApplicant of groupApplicants) {
        const selection: ApplicantSelection = {
          rank: groupApplicant.rank,
          groupId: matching.groupId,
          applicationGroupId: matching.applicationGroupId,
          interview: groupApplicant.interview,
        }
        const existing = applicants.get(groupApplicant.applicationId)

        if (existing !== undefined) {
          existing.selections.push(selection)
          continue
        }

        applicants.set(groupApplicant.applicationId, {
          selections: [selection],
          applicant: {
            applicationId: groupApplicant.applicationId,
            name: groupApplicant.name,
          },
        })
      }
    }

    for (const { selections } of applicants.values()) {
      selections.sort((a, b) => (a.rank ?? Number.POSITIVE_INFINITY) - (b.rank ?? Number.POSITIVE_INFINITY))
    }

    return applicants
  }, [groupMatchings])

  const applicants = useMemo(
    () =>
      [...applicantsByApplicationId.values()].map(({ applicant, selections }) => ({
        ...applicant,
        committees: selections.map((selection) => abbreviationBySlug.get(selection.groupId) ?? selection.groupId),
        interview: selections.at(0)?.interview ?? null,
      })),
    [applicantsByApplicationId, abbreviationBySlug]
  )

  const getHref = useCallback(
    (applicant: ApplicantRow) => {
      const applicationGroupId = applicantsByApplicationId
        .get(applicant.applicationId)
        ?.selections.at(0)?.applicationGroupId

      return `/admin/opptak/${application.id}/sokere/${applicationGroupId}/${applicant.applicationId}`
    },
    [application.id, applicantsByApplicationId]
  )

  if (application.interviewsPublishedAt === null && !isLoading) {
    return <NoAccessNotice />
  }

  return (
    <div className="flex flex-col gap-4">
      <ApplicantTable rows={applicants} getHref={getHref} showCommittees={isAdministrator} isLoading={isLoading} />
    </div>
  )
}
