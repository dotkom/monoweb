import type { FC } from "react"
import { useCommitteeAllQuery } from "../../../../modules/committee/queries/use-committee-all-query"
import { useEditEventWithCommitteesMutation } from "../../../../modules/event/mutations/use-edit-event-mutation-comittees"
import { useEventEditForm } from "../edit-form"
import { useEventDetailsContext } from "./provider"

export const EventEditCard: FC = () => {
  const { event, eventCommittees } = useEventDetailsContext()
  const edit = useEditEventWithCommitteesMutation()
  const { committees } = useCommitteeAllQuery()

  const defaultValues = {
    ...event,
    committeeIds: eventCommittees.map((committee) => committee.id),
  }

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
    defaultValues,
  })
  return <FormComponent />
}
