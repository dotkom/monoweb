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
      edit.mutate({
        id: data.id,
        changes: data,
      })
    },
    defaultValues: { ...event },
  })
  return <FormComponent />
}
