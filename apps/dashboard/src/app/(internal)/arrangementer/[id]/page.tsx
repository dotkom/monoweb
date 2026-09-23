"use client"

import { useGroupAllQuery } from "@/app/(internal)/grupper/queries"
import { EventEditForm } from "../components/EventEditForm"
import { ParentEventCard } from "../components/ParentEventCard"
import { useUpdateEventMutation } from "../mutations"
import { useEventEditPermission } from "../use-event-edit-permission"
import { useEventContext } from "./provider"

export default function EventPage() {
  const { event } = useEventContext()
  const { canEdit } = useEventEditPermission()
  const edit = useUpdateEventMutation()
  const { groups } = useGroupAllQuery()

  const defaultValues = {
    ...event,
    hostingGroupIds: event.hostingGroups.map((group) => group.slug),
    companyIds: event.companies.map((company) => company.id),
  }

  return (
    <div className="flex flex-col gap-4">
      <ParentEventCard eventId={event.id} disabled={!canEdit} />
      <EventEditForm
        submitLabel="Oppdater arrangement"
        hostingGroups={groups}
        disabled={!canEdit}
        defaultValues={defaultValues}
        onSubmit={(data) => {
          const { hostingGroupIds, companyIds, ...eventData } = data

          edit.mutate({
            id: data.id,
            event: eventData,
            groupIds: hostingGroupIds,
            companyIds,
            parentId: event.parentId,
          })
        }}
      />
    </div>
  )
}
