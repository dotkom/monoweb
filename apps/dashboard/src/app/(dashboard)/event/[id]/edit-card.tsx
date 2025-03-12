import type { FC } from "react"
import { useEditEventWithGroupsMutation } from "../../../../modules/event/mutations/use-edit-event-mutation-groups"
import { useGroupAllQuery } from "../../../../modules/group/queries/use-group-all-query"
import { useEventEditForm } from "../edit-form"
import { useEventDetailsContext } from "./provider"

export const EventEditCard: FC = () => {
  const { event, eventHostingGroups } = useEventDetailsContext()
  const edit = useEditEventWithGroupsMutation()
  const { groups } = useGroupAllQuery()

  const defaultValues = {
    ...event,
    groupIds: eventHostingGroups.map((group) => group.id),
  }

  const FormComponent = useEventEditForm({
    label: "Oppdater arrangement",
    hostingGroups: groups,
    onSubmit: (data) => {
      const { hostingGroupIds, ...event } = data
      edit.mutate({
        id: data.id,
        event,
        groups: hostingGroupIds,
      })
    },
    defaultValues,
  })
  return <FormComponent />
}
