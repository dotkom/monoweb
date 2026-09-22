"use client"

import { useContestEditPermission } from "@/hooks/use-contest-edit-permission"
import { ContestWriteForm } from "../ContestWriteForm"
import { useUpdateContestMutation } from "../mutations"
import { useContestContext } from "./provider"

export default function ContestInfoPage() {
  const { contest } = useContestContext()
  const canEdit = useContestEditPermission()
  const updateContest = useUpdateContestMutation()

  return (
    <ContestWriteForm
      onSubmit={(data) => updateContest.mutate({ contestId: contest.id, contest: data })}
      disabled={!canEdit}
      defaultValues={contest}
      submitLabel="Oppdater konkurranse"
    />
  )
}
