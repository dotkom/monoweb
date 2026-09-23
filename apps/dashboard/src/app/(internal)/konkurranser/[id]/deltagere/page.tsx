"use client"

import { useContestEditPermission } from "@/hooks/use-contest-edit-permission"
import { Button } from "@dotkomonline/ui"
import { IconUserPlus, IconUsersPlus } from "@tabler/icons-react"
import { useCallback, useMemo, useState } from "react"
import { useAddContestantMutation } from "../../mutations"
import { useContestContext } from "../provider"
import { AddIndividualContestantModal } from "./components/AddIndividualContestantModal"
import { TeamContestantWriteModal } from "./components/TeamContestantWriteModal"
import { ContestantTable } from "./components/ContestantTable"

type PageModalState = { kind: "add-individual" } | { kind: "add-team" }

function getResultSuffix(resultType: string): string | undefined {
  if (resultType === "DURATION") {
    return "sekunder"
  }

  if (resultType === "SCORE") {
    return "poeng"
  }

  return undefined
}

export default function ContestantsPage() {
  const { contest, contestants } = useContestContext()
  const canEdit = useContestEditPermission()
  const addContestant = useAddContestantMutation()
  const [modal, setModal] = useState<PageModalState | null>(null)

  const closeModal = useCallback(() => {
    setModal(null)
  }, [])

  const sortedContestants = useMemo(() => {
    return contestants.toSorted((a, b) => {
      if (a.resultValue == null && b.resultValue == null) {
        return 0
      }

      if (a.resultValue == null) {
        return 1
      }

      if (b.resultValue == null) {
        return -1
      }

      if (contest.resultOrder === "DESC") {
        return b.resultValue - a.resultValue
      }

      return a.resultValue - b.resultValue
    })
  }, [contestants, contest.resultOrder])

  const contestParticipantUserIds = useMemo(() => {
    const userIds = new Set<string>()

    for (const contestant of contestants) {
      if (contestant.userId !== null) {
        userIds.add(contestant.userId)
      }

      if (contestant.team !== null) {
        for (const member of contestant.team.members) {
          userIds.add(member.id)
        }
      }
    }

    return [...userIds]
  }, [contestants])

  const resultSuffix = getResultSuffix(contest.resultType)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={!canEdit}
          icon={<IconUserPlus className="size-4" />}
          onClick={() => {
            setModal({ kind: "add-individual" })
          }}
        >
          Legg til individ
        </Button>
        <Button
          disabled={!canEdit}
          icon={<IconUsersPlus className="size-4" />}
          onClick={() => {
            setModal({ kind: "add-team" })
          }}
        >
          Legg til lag
        </Button>
      </div>

      <AddIndividualContestantModal
        open={modal?.kind === "add-individual"}
        onOpenChange={(open) => {
          if (!open) {
            closeModal()
          }
        }}
        excludeUserIds={contestParticipantUserIds}
        disabled={!canEdit}
        onSubmit={(user) => {
          addContestant.mutate({ contestId: contest.id, data: { userId: user.id } })
        }}
      />

      <TeamContestantWriteModal
        open={modal?.kind === "add-team"}
        onOpenChange={(open) => {
          if (!open) {
            closeModal()
          }
        }}
        title="Legg til lag"
        submitLabel="Legg til lag"
        excludeUserIds={contestParticipantUserIds}
        disabled={!canEdit}
        isPending={addContestant.isPending}
        onSubmit={(data) => {
          addContestant.mutate(
            {
              contestId: contest.id,
              data: {
                teamName: data.teamName,
                memberIds: data.memberIds,
              },
            },
            { onSuccess: () => closeModal() }
          )
        }}
      />

      <ContestantTable
        contestants={sortedContestants}
        resultSuffix={resultSuffix}
        excludeUserIds={contestParticipantUserIds}
      />
    </div>
  )
}
