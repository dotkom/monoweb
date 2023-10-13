import { type FC } from "react"
import { useEventDetailsContext } from "./provider"
import { useEditEventMutation } from "../../../../modules/event/mutations/use-edit-event-mutation"
import { useEventEditForm } from "../edit-form"

export const EventEditCard: FC = () => {
  const { event } = useEventDetailsContext()
  const edit = useEditEventMutation()
  const FormComponent = useEventEditForm({
    label: "Oppdater arrangement",
    onSubmit: (data) => {
      edit.mutate({
        id: data.id,
        changes: data,
      })
    },
    defaultValues: { ...event },
  })
  return <FormComponent />
}
