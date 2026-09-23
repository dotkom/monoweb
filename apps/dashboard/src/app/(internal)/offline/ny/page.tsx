"use client"

import type { OfflineWrite } from "@dotkomonline/rpc/offline"
import { OfflineWriteForm } from "../OfflineWriteForm"
import { useCreateOfflineMutation } from "../mutations"

export default function Page() {
  const create = useCreateOfflineMutation()

  return (
    <OfflineWriteForm
      onSubmit={async (data) => {
        const toSave: OfflineWrite = {
          title: data.title,
          publishedAt: data.publishedAt,
          id: data.id,
          fileUrl: data.fileUrl,
          imageUrl: data.imageUrl,
        }

        create.mutate({
          ...toSave,
        })
        close()
      }}
      submitLabel="Registrer ny Offline"
    />
  )
}
