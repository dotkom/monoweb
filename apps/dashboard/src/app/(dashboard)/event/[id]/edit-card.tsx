import { FC } from "react"
import { useCommitteeAllQuery } from "src/modules/committee/queries/use-committee-all-query"
import { useEditEventWithCommitteesMutation } from "../../../../modules/event/mutations/use-edit-event-mutation-comittees"
import { useEventEditForm } from "../edit-form"
import { useEventDetailsContext } from "./provider"

export const EventEditCard: FC = () => {
  const { event, eventCommittees } = useEventDetailsContext()
  const edit = useEditEventWithCommitteesMutation()
  const { committees } = useCommitteeAllQuery()
  const FormComponent = useEventEditForm({
    label: "Oppdater arrangement",
    committees: committees,
    onSubmit: (data) => {
      const { committeeIds, ...event } = data
      edit.mutate({
        id: data.id,
        event: event,
        committees: committeeIds,
      })
    },
    defaultValues: {
      ...event,
      committeeIds: eventCommittees.map((committee) => committee.committeeId),
    },
  })
  return <FormComponent />
}
