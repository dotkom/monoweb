"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { ReadOnlyNotice } from "@/components/ReadOnlyNotice"
import type { EventId } from "@dotkomonline/rpc/event"
import { useState } from "react"
import { EventWriteForm } from "../components/EventWriteForm"
import { ParentEventCard } from "../components/ParentEventCard"
import { useCreateEventMutation } from "../mutations"

export default function Page() {
  const { canCreateEvents } = useAuthorization()
  const canCreate = canCreateEvents()
  const create = useCreateEventMutation()
  const [parentId, setParentId] = useState<EventId | null>(null)

  return (
    <div className="flex flex-col gap-4">
      {!canCreate && (
        <ReadOnlyNotice
          title="Du kan ikke opprette arrangementer."
          message="Dette er fordi du ikke tilhører noen grupper som kan opprette arrangementer. Kontakt dotkom dersom du mener dette er en feil."
        />
      )}
      <ParentEventCard parentId={parentId} onParentIdChange={setParentId} disabled={!canCreate} />
      <EventWriteForm
        disabled={!canCreate}
        onSubmit={(data) => {
          const { hostingGroupIds, companyIds, ...event } = data
          create.mutate({
            groupIds: hostingGroupIds,
            companyIds,
            event,
            parentId,
          })
        }}
      />
    </div>
  )
}
