"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { ReadOnlyNotice } from "@admin/components/ReadOnlyNotice"
import { useEditOfflineMutation } from "../mutations"
import { OfflineWriteForm } from "../OfflineWriteForm"
import { useOfflineDetailsContext } from "./provider"
import { canManageOfflines } from "@dotkomonline/rpc/offline-permissions"

export default function OfflinePage() {
  const { offline } = useOfflineDetailsContext()
  const edit = useEditOfflineMutation()

  const authorization = useAuthorization()
  const canEdit = canManageOfflines(authorization)

  return (
    <div className="flex flex-col gap-2">
      {!canEdit && (
        <ReadOnlyNotice
          title="Du kan ikke redigere Offline-utgaven."
          message="Dette er fordi du ikke er leder, nestleder eller redaktør i Redaksjonen. Kontakt dotkom dersom du mener dette er en feil."
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
