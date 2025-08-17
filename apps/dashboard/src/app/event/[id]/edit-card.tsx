import { useGroupAllQuery } from "@/app/group/queries"
import type { FC } from "react"
import { useEventEditForm } from "../components/edit-form"
import { useUpdateEventMutation } from "../mutations"
import { useEventContext } from "./provider"

export const EventEditCard: FC = () => {
  const { event, attendance } = useEventContext()
  const edit = useUpdateEventMutation()
  const { groups } = useGroupAllQuery()

  const defaultValues = {
    ...event,
    hostingGroupIds: event.hostingGroups.map((group) => group.slug),
  }

  const FormComponent = useEventEditForm({
    label: "Oppdater arrangement",
    hostingGroups: groups,
    onSubmit: (data) => {
      const { hostingGroupIds, ...event } = data
      edit.mutate({
        id: data.id,
        event,
        groupIds: hostingGroupIds,
        companies: data.companies.map((company) => company.id),
      })
    },
    defaultValues,
  })
  return <FormComponent />
}
