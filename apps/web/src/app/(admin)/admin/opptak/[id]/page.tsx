"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { useGroupAllQuery } from "@admin/grupper/queries"
import { useMemo } from "react"
import { ApplicationWriteForm } from "../ApplicationWriteForm"
import { useUpdateApplicationPeriodMutation } from "../mutations"
import { useApplicationPeriodGroupsQuery } from "../queries"
import { toLocalInterviewDate, toPeriodWrite } from "../validation"
import { useApplicationContext } from "./provider"

export default function ApplicationInfoPage() {
  const { application } = useApplicationContext()
  const { canEditApplication } = useAuthorization()
  const canEdit = canEditApplication()
  const updateApplicationPeriod = useUpdateApplicationPeriodMutation()
  const { applicationGroups, isLoading } = useApplicationPeriodGroupsQuery(application.id)
  const { groups, isFetching: isFetchingGroups } = useGroupAllQuery()
  const hasLoadedGroups = groups.length > 0 || !isFetchingGroups

  const existingConfigurationByGroupId = useMemo(
    () =>
      new Map(
        applicationGroups.map((applicationGroup) => [
          applicationGroup.groupId,
          { type: applicationGroup.type, interviewDuration: applicationGroup.interviewDuration },
        ])
      ),
    [applicationGroups]
  )

  const defaultValues = useMemo(() => {
    const groupTypeBySlug = new Map(groups.map((group) => [group.slug, group.type]))
    const selectedGroupIds = applicationGroups.map((applicationGroup) => applicationGroup.groupId)

    return {
      ...application,
      interviewsStartDate: toLocalInterviewDate(application.interviewsStartDate),
      interviewsEndDate: toLocalInterviewDate(application.interviewsEndDate),
      committeeGroups: selectedGroupIds.filter((groupId) => groupTypeBySlug.get(groupId) === "COMMITTEE"),
      nodeAndAssociatedGroups: selectedGroupIds.filter((groupId) => {
        const groupType = groupTypeBySlug.get(groupId)

        return groupType === "NODE_COMMITTEE" || groupType === "ASSOCIATED"
      }),
    }
  }, [application, applicationGroups, groups])

  if (isLoading || !hasLoadedGroups) {
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      <ApplicationWriteForm
        onSubmit={(data) => {
          const write = toPeriodWrite(data)

          if (write === null) {
            return
          }

          updateApplicationPeriod.mutate({
            applicationPeriodId: application.id,
            applicationPeriod: write.applicationPeriod,
            groups: write.groups.map((group) => {
              const existingConfiguration = existingConfigurationByGroupId.get(group.groupId)

              return existingConfiguration === undefined ? group : { ...group, ...existingConfiguration }
            }),
          })
        }}
        disabled={!canEdit}
        defaultValues={defaultValues}
        submitLabel="Oppdater opptak"
      />
    </div>
  )
}
