import { FC } from "react"
import { trpc } from "../../../../utils/trpc"
import { useEventWriteForm } from "../write-form"
import { EventWriteSchema } from "@dotkomonline/types"
import { useEventDetailsContext } from "./provider"
import { useQueryNotification } from "../../../notifications"

export const EventEditCard: FC = () => {
  const { event } = useEventDetailsContext()
  const notification = useQueryNotification()
  const utils = trpc.useContext()
  const edit = trpc.event.edit.useMutation({
    onSuccess: (data) => {
      notification.complete({
        title: "Arrangement oppdatert",
        message: `Arrangementet "${data.title}" har blitt oppdatert.`,
      })
      utils.event.all.invalidate()
    },
    onError: (err) => {
      notification.fail({
        title: "Feil oppsto",
        message: `En feil oppsto under oppdatering av arrangementet: ${err.toString()}.`,
      })
    },
  })
  const FormComponent = useEventWriteForm({
    label: "Oppdater arrangement",
    onSubmit: (data) => {
      notification.loading({
        title: "Oppdaterer arrangement...",
        message: "Arrangementet blir oppdatert.",
      })
      const result = EventWriteSchema.required({ id: true }).parse(data)
      edit.mutate(result)
    },
    defaultValues: { ...event },
  })
  return <FormComponent />
}
