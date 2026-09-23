"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { PermissionTooltip } from "@admin/components/PermissionTooltip"
import { useGroupAbbreviationMap } from "@admin/grupper/queries"
import { ConfirmModal } from "@admin/components/molecules/ConfirmDeleteModal/ConfirmDeleteModal"
import { useConfirmInterviewsMutation, useRunInterviewMatchingMutation } from "../mutations"
import { useApplicationPeriodGroupsQuery } from "../queries"
import type { CommitteeApplicationPeriod } from "@dotkomonline/rpc/committee-application"
import { Button, cn } from "@dotkomonline/ui"
import { IconArrowsShuffle } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export const CONFIRMED_MESSAGE =
  "Intervjuene har blitt publisert, du kan ikke gjøre endringer på tidligere stadier i prosessen."
const PERIOD_OPEN_MESSAGE = "Søknadsperioden er ikke ferdig"

export const Matching = ({ application }: { application: CommitteeApplicationPeriod }) => {
  const router = useRouter()
  const { applicationGroups } = useApplicationPeriodGroupsQuery(application.id)
  const { abbreviationBySlug } = useGroupAbbreviationMap()
  const { canEditApplication, canViewApplicationMatching } = useAuthorization()

  const runInterviewMatching = useRunInterviewMatchingMutation()
  const confirmInterviews = useConfirmInterviewsMutation()
  const [isRunConfirmOpen, setIsRunConfirmOpen] = useState(false)

  const missingAvailability = applicationGroups
    .filter((group) => group.interviewBlockCount === 0 || !group.hasAllValidRooms)
    .map((group) => abbreviationBySlug.get(group.groupId) ?? group.groupId)

  const canEdit = canEditApplication()
  const isConfirmed = application.interviewsPublishedAt !== null
  const isPending = runInterviewMatching.isPending || confirmInterviews.isPending
  const confirmedLabel = isConfirmed ? CONFIRMED_MESSAGE : undefined

  const canRun = canEdit && !isConfirmed && application.applicationsCloseAt < new Date()

  const runAndPublish = () =>
    runInterviewMatching.mutate(
      { applicationPeriodId: application.id },
      {
        onSuccess: () =>
          confirmInterviews.mutate(
            { applicationPeriodId: application.id },
            { onSuccess: () => router.push(`/admin/opptak/${application.id}/intervjutider`) }
          ),
      }
    )

  if (!canViewApplicationMatching()) {
    return null
  }

  return (
    <>
      <PermissionTooltip
        allowed={canRun}
        label={canEdit ? (confirmedLabel ?? PERIOD_OPEN_MESSAGE) : undefined}
        className={cn("flex", canEdit && !canRun && "cursor-not-allowed")}
      >
        <Button
          variant="default"
          icon={<IconArrowsShuffle className="size-3.5" />}
          disabled={!canRun || isPending}
          onClick={() => (missingAvailability.length === 0 ? runAndPublish() : setIsRunConfirmOpen(true))}
        >
          Kjør matching og publiser intervjuer
        </Button>
      </PermissionTooltip>

      <ConfirmModal
        open={isRunConfirmOpen}
        onOpenChange={setIsRunConfirmOpen}
        title="Er du sikker på at du vil kjøre matching-algoritmen og publisere intervjuene?"
        description={
          <span className="text-destructive">
            {`${missingAvailability.length} av ${applicationGroups.length} komitéer mangler gyldig tilgjengelighet: ${missingAvailability.join(", ")}.`}
          </span>
        }
        confirmLabel="Ja, kjør og publiser"
        confirmIcon={<IconArrowsShuffle className="size-4" />}
        onConfirm={runAndPublish}
      />
    </>
  )
}
