"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { PermissionTooltip } from "@admin/components/PermissionTooltip"
import { useGroupAbbreviationMap } from "@admin/grupper/queries"
import { ConfirmModal } from "@admin/components/molecules/ConfirmDeleteModal/ConfirmDeleteModal"
import { useConfirmInterviewsMutation, useRunInterviewMatchingMutation } from "../mutations"
import { useApplicationPeriodGroupMatchingsQuery, useApplicationPeriodGroupsQuery } from "../queries"
import type {
  CommitteeApplicationGroupMatching,
  CommitteeApplicationPeriod,
} from "@dotkomonline/rpc/committee-application"
import { Badge, type BadgeColor, Button, Tooltip, TooltipContent, TooltipTrigger } from "@dotkomonline/ui"
import { IconArrowsShuffle, IconUser } from "@tabler/icons-react"
import { type ReactNode, useState } from "react"

export const CONFIRMED_MESSAGE =
  "Intervjuene har blitt publisert, du kan ikke gjøre endringer på tidligere stadier i prosessen."
const PERIOD_OPEN_MESSAGE = "Søknadsperioden er ikke ferdig"

const toPercentage = (part: number, total: number) => (total === 0 ? 0 : Math.round((part / total) * 100))

const summarize = (groupMatchings: CommitteeApplicationGroupMatching[]) => {
  const matched = groupMatchings.reduce((sum, group) => sum + group.matchedApplicants, 0)
  const total = groupMatchings.reduce((sum, group) => sum + group.totalApplicants, 0)
  const applicationIds = groupMatchings.flatMap((group) =>
    [...group.matchedInterviews, ...group.unmatchedApplicants].map((applicant) => applicant.applicationId)
  )

  return { matched, total, percentage: toPercentage(matched, total), applicants: new Set(applicationIds).size }
}

const MatchingStat = ({
  icon,
  label,
  value,
  color,
}: {
  icon: ReactNode
  label: string
  value: ReactNode
  color: BadgeColor
}) => (
  <Tooltip>
    <TooltipTrigger className="flex items-center gap-1.5 text-muted-foreground">
      {icon}
      <Badge color={color} variant="default" className="gap-1 tabular-nums">
        {value}
      </Badge>
    </TooltipTrigger>
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>
)

export const Matching = ({ application }: { application: CommitteeApplicationPeriod }) => {
  const { groupMatchings } = useApplicationPeriodGroupMatchingsQuery(application.id)
  const { applicationGroups } = useApplicationPeriodGroupsQuery(application.id)
  const { abbreviationBySlug } = useGroupAbbreviationMap()
  const { canEditApplication, canViewApplicationMatching } = useAuthorization()

  const runInterviewMatching = useRunInterviewMatchingMutation()
  const confirmInterviews = useConfirmInterviewsMutation()
  const [isRunConfirmOpen, setIsRunConfirmOpen] = useState(false)

  const missingAvailability = applicationGroups
    .filter((group) => group.interviewBlockCount === 0 || !group.hasAllValidRooms)
    .map((group) => abbreviationBySlug.get(group.groupId) ?? group.groupId)

  const { matched, total, percentage, applicants } = summarize(groupMatchings)

  const canEdit = canEditApplication()
  const hasRunMatching = matched > 0
  const isConfirmed = application.interviewsPublishedAt !== null
  const isPending = runInterviewMatching.isPending || confirmInterviews.isPending
  const confirmedLabel = isConfirmed ? CONFIRMED_MESSAGE : undefined

  const canRun = canEdit && !isConfirmed && application.applicationsCloseAt < new Date()

  if (!canViewApplicationMatching()) {
    return null
  }

  return (
    <div className="flex flex-col items-center gap-2 px-2.5 pb-1">
      {hasRunMatching && (
        <div className="flex items-center gap-2">
          <MatchingStat
            icon={<IconUser className="size-4 shrink-0" stroke={2} />}
            label="Totalt antall personer som har søkt komitée"
            value={applicants}
            color="gray"
          />
          <MatchingStat
            icon={<IconArrowsShuffle className="size-4 shrink-0" stroke={2} />}
            label="Antall komitésøknader som har fått et intervju"
            value={`${matched} / ${total} (${percentage} %)`}
            color={percentage === 100 ? "green" : "red"}
          />
        </div>
      )}

      <PermissionTooltip
        allowed={canRun}
        label={canEdit ? (confirmedLabel ?? PERIOD_OPEN_MESSAGE) : undefined}
        className={canEdit && !canRun ? "cursor-not-allowed" : undefined}
      >
        <Button
          variant="default"
          className="rounded-b-none"
          icon={<IconArrowsShuffle />}
          disabled={!canRun || isPending}
          onClick={() => setIsRunConfirmOpen(true)}
        >
          Kjør matching og publiser intervjuer
        </Button>
      </PermissionTooltip>

      <ConfirmModal
        open={isRunConfirmOpen}
        onOpenChange={setIsRunConfirmOpen}
        title="Er du sikker på at du vil kjøre matching-algoritmen og publisere intervjuene?"
        description={
          missingAvailability.length === 0
            ? `Alle ${applicationGroups.length} komitéer har fylt ut tilgjengelighet.`
            : `${missingAvailability.length} av ${applicationGroups.length} komitéer mangler tilgjengelighet, og får ingen intervjuer: ${missingAvailability.join(", ")}.`
        }
        confirmLabel="Ja, kjør og publiser"
        confirmIcon={<IconArrowsShuffle className="size-4" />}
        onConfirm={() => {
          runInterviewMatching.mutate(
            { applicationPeriodId: application.id },
            { onSuccess: () => confirmInterviews.mutate({ applicationPeriodId: application.id }) }
          )
        }}
      />
    </div>
  )
}
