import { useGroupAllQuery } from "@/app/(internal)/grupper/queries"
import type { FC } from "react"
import { Stack } from "@mantine/core"
import { useCompanyAllQuery } from "@/app/(internal)/bedrifter/queries"
import { useEventEditForm } from "../components/edit-form"
import { ParentEventCard } from "../components/parent-event-card"
import { useEventEditPermission } from "@/hooks/use-event-edit-permission"
import { useUpdateEventMutation } from "../mutations"
import { useEventContext } from "./provider"

export const EventEditCard: FC = () => {
  const { event } = useEventContext()
  const { canEdit } = useEventEditPermission()
  const edit = useUpdateEventMutation()
  const { groups } = useGroupAllQuery()
  const { companies } = useCompanyAllQuery()

  const defaultValues = {
    ...event,
    hostingGroupIds: event.hostingGroups.map((group) => group.slug),
    companyIds: event.companies.map((company) => company.id),
  }

  const FormComponent = useEventEditForm({
    label: "Oppdater arrangement",
    hostingGroups: groups,
    companies: companies,
    disabled: !canEdit,
    onSubmit: (data) => {
      const { hostingGroupIds, companyIds, ...eventData } = data

      edit.mutate({
        id: data.id,
        event: eventData,
        groupIds: hostingGroupIds,
        companyIds,
        parentId: event.parentId,
      })
    },
    defaultValues,
  })

  return (
    <Stack>
      <ParentEventCard eventId={event.id} disabled={!canEdit} />
      <FormComponent />
    </Stack>
  )
}
