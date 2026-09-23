"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { ReadOnlyNotice } from "@/components/ReadOnlyNotice"
import { useEditOfflineMutation } from "../mutations"
import { OfflineWriteForm } from "../OfflineWriteForm"
import { useOfflineDetailsContext } from "./provider"

export default function OfflinePage() {
  const { offline } = useOfflineDetailsContext()
  const edit = useEditOfflineMutation()

  const { canEditOffline } = useAuthorization()
  const canEdit = canEditOffline()

  return (
    <div className="flex flex-col gap-2">
      {!canEdit && (
        <ReadOnlyNotice
          title="Du kan ikke redigere Offline-utgaven."
          message="Dette er fordi du ikke er leder, nestleder eller redaktør i Prokom. Kontakt dotkom dersom du mener dette er en feil."
        />
      )}

      <OfflineWriteForm
        submitLabel="Oppdater Offline"
        onSubmit={(data) => {
          edit.mutate({ id: offline.id, input: data })
        }}
        defaultValues={offline}
        disabled={!canEdit}
      />
    </div>
  )
}
