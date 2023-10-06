import { FC } from "react"
import { useEventWriteForm } from "../../../../modules/event/write-form"
import { EventWriteSchema } from "@dotkomonline/types"
import { useEventDetailsContext } from "./provider"
import { useEditEventMutation } from "../../../../modules/event/mutations/use-edit-event-mutation"

export const EventEditCard: FC = () => {
  const { event } = useEventDetailsContext()
  const edit = useEditEventMutation()
  const FormComponent = useEventWriteForm({
    label: "Oppdater arrangement",
    onSubmit: (data) => {
      const result = EventWriteSchema.required({ id: true }).parse(data)
      edit.mutate(result)
    },
    defaultValues: { ...event },
  })
  return <FormComponent />
}
