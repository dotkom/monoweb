"use client"

import { canManageEventFeaturedPriorities } from "@dotkomonline/rpc/event-permissions"
import { useAuthorization } from "@admin/auth/authorization-context"
import { useGroupAllQuery } from "@admin/grupper/queries"
import { EventEditForm } from "../components/EventEditForm"
import { EventFeaturedPriority } from "../components/EventFeaturedPriority"
import { ParentEventCard } from "../components/ParentEventCard"
import { useUpdateEventMutation } from "../mutations"
import { useEventEditPermission } from "../use-event-edit-permission"
import { useEventContext } from "./provider"
import { Separator } from "@dotkomonline/ui"

export default function EventPage() {
  const authorization = useAuthorization()
  const canManagePriorities = canManageEventFeaturedPriorities(authorization)
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
    <div className="flex flex-col gap-8">
      <ParentEventCard eventId={event.id} disabled={!canEdit} />

      {canManagePriorities && <EventFeaturedPriority key={event.id} eventId={event.id} />}

      <Separator />

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
