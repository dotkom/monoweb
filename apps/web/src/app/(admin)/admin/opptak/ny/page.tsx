"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { ReadOnlyNotice } from "@admin/components/ReadOnlyNotice"
import { ApplicationWriteForm } from "../ApplicationWriteForm"

export default function CreateApplicationPage() {
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
        onSubmit={() => {
          // Legge til logikk når gutta er ferdig med schema, zzzZZzz
        }}
        disabled={!canCreate}
      />
    </div>
  )
}
