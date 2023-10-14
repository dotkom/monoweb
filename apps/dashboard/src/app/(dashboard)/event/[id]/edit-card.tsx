import { FC } from "react"
import { useEditEventMutation } from "../../../../modules/event/mutations/use-edit-event-mutation"
import { useEventEditForm } from "../edit-form"
import { useEventDetailsContext } from "./provider"
import { useCommitteeAllQuery } from "src/modules/committee/queries/use-committee-all-query"

export const EventEditCard: FC = () => {
  const { event, eventCommittees } = useEventDetailsContext()
  const edit = useEditEventMutation()
  const { committees } = useCommitteeAllQuery()
  const FormComponent = useEventEditForm({
    label: "Oppdater arrangement",
    committees: committees,
    onSubmit: (data) => {
      const { committees, ...event } = data
      edit.mutate({
        id: data.id,
        event: event,
        committees: committees,
      })
    },
    defaultValues: {
      ...event,
      committees: eventCommittees.map((committee) => committee.committeeId),
    },
  })
  return <FormComponent />
}
