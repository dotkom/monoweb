import { FC } from "react"
import { useOfflineWriteForm } from "../write-form"
import { useOfflineDetailsContext } from "./provider"
import { useEditOfflineMutation } from "../../../../modules/offline/mutations/use-edit-offline-mutation"

export const OfflineEditCard: FC = () => {
  const { offline } = useOfflineDetailsContext()
  const edit = useEditOfflineMutation()

  const FormComponent = useOfflineWriteForm({
    label: "Oppdater",
    onSubmit: (data) => {
      edit.mutate({
        id: offline.id,
        input: data,
      })
    },
    defaultValues: offline,
  })
  return <FormComponent />
}
