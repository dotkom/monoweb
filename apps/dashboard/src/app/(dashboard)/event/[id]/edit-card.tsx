import { FC } from "react"
import { useEditEventMutation } from "../../../../modules/event/mutations/use-edit-event-mutation"
import { useEventEditForm } from "../edit-form"
import { useEventDetailsContext } from "./provider"

export const EventEditCard: FC = () => {
  const { event } = useEventDetailsContext()
  const edit = useEditEventMutation()
  const FormComponent = useEventEditForm({
    label: "Oppdater arrangement",
    onSubmit: (data) => {
      const { eventCommittees, ...event } = data
      edit.mutate({
        id: data.id,
        event: event,
        committees: eventCommittees,
      })
    },
    defaultValues: {
      ...event,
      eventCommittees: event.eventCommittees.map((com) => com.committeeId),
    },
  })
  return <FormComponent />
}
