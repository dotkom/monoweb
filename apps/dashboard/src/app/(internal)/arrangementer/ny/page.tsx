"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { ReadOnlyNotice } from "@/components/ReadOnlyNotice"
import { Stack } from "@mantine/core"
import type { EventId } from "@dotkomonline/rpc/event"
import { useState } from "react"
import { useEventWriteForm } from "../components/write-form"
import { ParentEventCard } from "../components/parent-event-card"
import { useCreateEventMutation } from "../mutations"

export default function Page() {
  const { canCreateEvents } = useAuthorization()
  const canCreate = canCreateEvents()
  const create = useCreateEventMutation()
  const [parentId, setParentId] = useState<EventId | null>(null)

  const FormComponent = useEventWriteForm({
    disabled: !canCreate,
    onSubmit: (data) => {
      const { hostingGroupIds, companyIds, ...event } = data
      create.mutate({
        groupIds: hostingGroupIds,
        companyIds,
        event,
        parentId,
      })
    },
  })

  return (
    <Stack>
      {!canCreate && (
        <ReadOnlyNotice
          title="Du kan ikke opprette arrangementer."
          message="Dette er fordi du ikke tilhører noen grupper som kan opprette arrangementer. Kontakt dotkom dersom du mener dette er en feil."
        />
      )}
      <ParentEventCard parentId={parentId} onParentIdChange={setParentId} disabled={!canCreate} />
      <FormComponent />
    </Stack>
  )
}
