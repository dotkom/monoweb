import { EventEditSchema } from "@dotkomonline/types"
import { FC } from "react"
import { useEditEventMutation } from "../../../../modules/event/mutations/use-edit-event-mutation"
import { useEventWriteForm } from "../write-form"
import { useEventDetailsContext } from "./provider"

export const EventEditCard: FC = () => {
  const { event } = useEventDetailsContext()
  const edit = useEditEventMutation()
  const FormComponent = useEventWriteForm({
    label: "Oppdater arrangement",
    onSubmit: (data) => {
      const result = EventEditSchema.parse(data)
      edit.mutate({
        id: result.id,
        changes: result,
      })
    },
    defaultValues: { ...event },
  })
  return <FormComponent />
}
