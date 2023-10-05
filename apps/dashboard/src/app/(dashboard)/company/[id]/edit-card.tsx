import { FC } from "react"
import { trpc } from "../../../../utils/trpc"
import { CompanyWriteSchema } from "@dotkomonline/types"
import { useCompanyDetailsContext } from "./provider"
import { useQueryNotification } from "../../../notifications"

export const EventEditCard: FC = () => {
  const { company } = useCompanyDetailsContext()
  const notification = useQueryNotification()
  const utils = trpc.useContext()
  const edit = trpc.company.edit.useMutation({
    onSuccess: (data) => {
      notification.complete({
        title: "Bedrift oppdatert",
        message: `Bedriften "${data.name}" har blitt oppdatert.`,
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
      const result = CompanyWriteSchema.required({ id: true }).parse(data)
      edit.mutate(result)
    },
    defaultValues: { ...event },
  })
  return <FormComponent />
}
