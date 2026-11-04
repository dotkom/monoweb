"use client"

import { OfflineWriteForm } from "../OfflineWriteForm"
import { useCreateOfflineMutation } from "../mutations"

export default function Page() {
  const createOffline = useCreateOfflineMutation()

  return (
    <OfflineWriteForm
      onSubmit={(data) => createOffline.mutate(data)}
      submitLabel="Registrer ny Offline"
      disabled={createOffline.isPending}
    />
  )
}
