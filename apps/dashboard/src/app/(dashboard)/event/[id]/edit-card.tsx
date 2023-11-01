import { type FC } from "react"
import { useCommitteeAllQuery } from "src/modules/committee/queries/use-committee-all-query"
import { useEventDetailsContext } from "./provider"
import { useEditEventMutation } from "../../../../modules/event/mutations/use-edit-event-mutation"
import { useEventEditForm } from "../edit-form"

export const EventEditCard: FC = () => {
  const { event, eventCommittees } = useEventDetailsContext()
  const edit = useEditEventMutation()
  const { committees } = useCommitteeAllQuery()
  const FormComponent = useEventEditForm({
    label: "Oppdater arrangement",
    committees,
    onSubmit: (data) => {
      const { committeeIds, ...event } = data
      edit.mutate({
        id: data.id,
        event,
        committeeIds,
      })
    },
    defaultValues: {
      ...event,
      committeeIds: eventCommittees.map((committee) => committee.committeeId),
    },
  })
  return <FormComponent />
}
