import { FC } from "react"
import { trpc } from "../../../../utils/trpc"
import { useEventWriteForm } from "../write-form"
import { EventWriteSchema } from "@dotkomonline/types"
import { useEventDetailsContext } from "./provider"
import { useQueryNotification } from "../../../notifications"
import { useEditEvent } from "../../../../modules/event/use-edit-event"

export const EventEditCard: FC = () => {
  const { event } = useEventDetailsContext()
  const edit = useEditEvent()
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
