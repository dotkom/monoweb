"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { ReadOnlyNotice } from "@/components/ReadOnlyNotice"
import { ContestWriteForm } from "../ContestWriteForm"
import { useCreateContestMutation } from "../mutations"

export default function CreateContestPage() {
  const create = useCreateContestMutation()
  const { canCreateEvents } = useAuthorization()
  const canCreate = canCreateEvents()

  return (
    <div className="flex flex-col gap-4">
      {!canCreate && (
        <ReadOnlyNotice
          title="Du kan ikke opprette konkurranser."
          message="Dette er fordi du ikke tilhører noen grupper som kan opprette konkurranser. Kontakt dotkom dersom du mener dette er en feil."
        />
      )}

      <ContestWriteForm
        onSubmit={(data) => {
          create.mutate({
            contest: {
              name: data.name,
              description: data.description || null,
              startDate: data.startDate ?? null,
              resultType: data.resultType,
              resultOrder: data.resultOrder,
              groups: data.groups,
            },
          })
        }}
        disabled={!canCreate}
      />
    </div>
  )
}
