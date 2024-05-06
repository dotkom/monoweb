import type { FC } from "react"
import { useEditOfflineMutation } from "../../../../modules/offline/mutations/use-edit-offline-mutation"
import { useOfflineWriteForm } from "../write-form"
import { useOfflineDetailsContext } from "./provider"

export const OfflineEditCard: FC = () => {
  const { offline } = useOfflineDetailsContext()
  const edit = useEditOfflineMutation()

  const FormComponent = useOfflineWriteForm({
    label: "Oppdater",
    onSubmit: async (data) => {
      edit.mutate({
        id: offline.id,
        input: {
          ...data,
          imageId: data.image.id,
        },
      })
    },
    defaultValues: offline,
  })
  return <FormComponent />
}
