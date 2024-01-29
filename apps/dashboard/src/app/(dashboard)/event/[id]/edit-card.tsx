import { type FC } from "react"
import { useEventDetailsContext } from "./provider"
import { useEditEventWithCommitteesMutation } from "../../../../modules/event/mutations/use-edit-event-mutation-comittees"
import { useEventEditForm } from "../edit-form"
import { useCommitteeAllQuery } from "../../../../modules/committee/queries/use-committee-all-query"

export const EventEditCard: FC = () => {
  const { event, eventCommittees } = useEventDetailsContext()
  const edit = useEditEventWithCommitteesMutation()
  const { committees } = useCommitteeAllQuery()
  const FormComponent = useEventEditForm({
    label: "Oppdater arrangement",
    committees,
    onSubmit: (data) => {
      const { committeeIds, ...event } = data
      edit.mutate({
        id: data.id,
        event,
        committees: committeeIds,
      })
    },
    defaultValues: {
      ...event,
      committeeIds: eventCommittees.map((committee) => committee.id),
    },
  })
  return <FormComponent />
}
