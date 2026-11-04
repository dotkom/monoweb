"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { canManageFadderuker } from "@dotkomonline/rpc/fadderuke-permissions"
import { FadderukeWriteForm } from "../FadderukeWriteForm"
import { useUpdateFadderukeMutation } from "../mutations"
import { useFadderukeDetailsContext } from "./provider"

export default function FadderukeDetailsPage() {
  const { fadderuke } = useFadderukeDetailsContext()
  const update = useUpdateFadderukeMutation()
  const authorization = useAuthorization()
  const canEdit = canManageFadderuker(authorization)

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
