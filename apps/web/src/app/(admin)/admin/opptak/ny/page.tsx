"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { ReadOnlyNotice } from "@admin/components/ReadOnlyNotice"
import { ApplicationWriteForm } from "../ApplicationWriteForm"
import { useCreateApplicationPeriodMutation } from "../mutations"
import { toPeriodWrite } from "../validation"

export default function CreateApplicationPage() {
  const create = useCreateApplicationPeriodMutation()
  const { canEditApplication } = useAuthorization()
  const canCreate = canEditApplication()

  return (
    <div className="flex flex-col gap-4">
      {!canCreate && (
        <ReadOnlyNotice
          title="Du kan ikke opprette opptak."
          message="Dette er fordi du ikke tilhører noen grupper som kan opprette opptak. Kontakt dotkom dersom du mener dette er en feil."
        />
      )}

      <ApplicationWriteForm
        onSubmit={(data) => {
          const write = toPeriodWrite(data)

          if (write !== null) {
            create.mutate(write)
          }
        }}
        disabled={!canCreate}
      />
    </div>
  )
}
