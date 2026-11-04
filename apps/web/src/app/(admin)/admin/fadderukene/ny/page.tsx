"use client"

import { FadderukeWriteForm } from "../FadderukeWriteForm"
import { useCreateFadderukeMutation } from "../mutations"

export default function CreateFadderukePage() {
  const create = useCreateFadderukeMutation()

  return (
    <FadderukeWriteForm
      submitLabel="Opprett fadderuke"
      onSubmit={(data) => {
        create.mutate({ fadderuke: data })
      }}
    />
  )
}
