import { type FC } from "react"
import { useEventDetailsContext } from "./provider"
import { useEditEventWithCommitteesMutation } from "../../../../modules/event/mutations/use-edit-event-mutation-comittees"
import { useEventEditForm } from "../edit-form"
import { useCommitteeAllQuery } from "../../../../modules/committee/queries/use-committee-all-query"

export const EventEditCard: FC = () => {
  const { event, eventCommittees } = useEventDetailsContext()
  const edit = useEditEventWithCommitteesMutation()
  const { committees } = useCommitteeAllQuery()
  console.log(eventCommittees, "HELLO")

  const defaultValues = {
    ...event,
    committeeIds: eventCommittees.map((committee) => committee.name),
  }

  console.log(eventCommittees)
  console.log("passed in default values", defaultValues)

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
