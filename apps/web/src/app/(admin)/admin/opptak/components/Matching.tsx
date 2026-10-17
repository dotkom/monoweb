"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { PermissionTooltip } from "@admin/components/PermissionTooltip"
import { useConfirmInterviewsMutation, useRunInterviewMatchingMutation } from "../mutations"
import { useApplicationPeriodGroupsQuery } from "../queries"
import type { CommitteeApplicationPeriod } from "@dotkomonline/rpc/committee-application"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  Button,
  cn,
} from "@dotkomonline/ui"
import { IconArrowsShuffle, IconCancel, IconCheck, IconLoader2 } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export const CONFIRMED_MESSAGE =
  "Intervjuene har blitt publisert, du kan ikke gjøre endringer på tidligere stadier i prosessen."
const PERIOD_OPEN_MESSAGE = "Søknadsperioden er ikke ferdig"

export const Matching = ({ application }: { application: CommitteeApplicationPeriod }) => {
  const router = useRouter()
  const { applicationGroups } = useApplicationPeriodGroupsQuery(application.id)
  const { canEditApplication, canViewApplicationMatching } = useAuthorization()

  const runInterviewMatching = useRunInterviewMatchingMutation()
  const confirmInterviews = useConfirmInterviewsMutation()
  const [isRunConfirmOpen, setIsRunConfirmOpen] = useState(false)

  const availableCount = applicationGroups.filter(
    (group) => group.interviewBlockCount > 0 && group.hasAllValidRooms
  ).length

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
            { onSuccess: () => router.push(`/admin/opptak/${application.id}/intervjuer`) }
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
          iconRight={
            isPending ? (
              <IconLoader2 className="size-3.5 animate-spin" />
            ) : (
              isConfirmed && <IconCheck className="size-3.5" />
            )
          }
          disabled={!canRun || isPending}
          onClick={() => (availableCount === applicationGroups.length ? runAndPublish() : setIsRunConfirmOpen(true))}
        >
          {isConfirmed ? "Matching kjørt og intervjuene publisert" : "Kjør matching-algoritme og publiser intervjuene"}
        </Button>
      </PermissionTooltip>

      <AlertDialog open={isRunConfirmOpen} onOpenChange={setIsRunConfirmOpen}>
        <AlertDialogContent size="md" onOutsideClick={() => setIsRunConfirmOpen(false)}>
          <AlertDialogTitle>
            Er du sikker på at du vil kjøre matching-algoritmen og publisere intervjuene?
          </AlertDialogTitle>
          <AlertDialogDescription>
            <span className="text-destructive">
              {`Kun ${availableCount}/${applicationGroups.length} komitéer har fylt ut tilgjengelighet`}
            </span>
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel type="button" variant="secondary">
              <IconCancel className="size-4" />
              Nei
            </AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={() => {
                runAndPublish()
                setIsRunConfirmOpen(false)
              }}
            >
              <IconArrowsShuffle className="size-4" />
              Ja, kjør og publiser
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
