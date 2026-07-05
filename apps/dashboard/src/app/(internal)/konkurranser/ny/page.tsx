"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { ReadOnlyNotice } from "@/components/ReadOnlyNotice"
import { Stack } from "@mantine/core"
import { useContestWriteForm } from "../components/contest-write-form"
import { useCreateContestMutation } from "../mutations"

export default function CreateContestPage() {
  const create = useCreateContestMutation()
  const { canCreateEvents } = useAuthorization()
  const canCreate = canCreateEvents()

  const FormComponent = useContestWriteForm({
    disabled: !canCreate,
    onSubmit: (data) => {
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
    },
  })

  return (
    <Stack>
      {!canCreate && (
        <ReadOnlyNotice
          title="Du kan ikke opprette konkurranser."
          message="Dette er fordi du ikke tilhører noen grupper som kan opprette konkurranser. Kontakt dotkom dersom du mener dette er en feil."
        />
      )}
      <FormComponent />
    </Stack>
  )
}
