"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { FadderukeWriteForm } from "../FadderukeWriteForm"
import { useUpdateFadderukeMutation } from "../mutations"
import { useFadderukeDetailsContext } from "./provider"

export default function FadderukeDetailsPage() {
  const { fadderuke } = useFadderukeDetailsContext()
  const update = useUpdateFadderukeMutation()
  const { canEditFadderuke } = useAuthorization()
  const canEdit = canEditFadderuke()

  return (
    <FadderukeWriteForm
      disabled={!canEdit}
      submitLabel="Oppdater fadderuke"
      defaultValues={{ year: fadderuke.year, eventId: fadderuke.eventId }}
      onSubmit={(data) => {
        update.mutate({
          fadderukeId: fadderuke.id,
          fadderuke: data,
        })
      }}
    />
  )
}
