import { useAuthorization } from "@/auth/authorization-context"
import type { FC } from "react"
import { Stack } from "@mantine/core"
import { useEditOfflineMutation } from "../mutations/use-edit-offline-mutation"
import { useOfflineWriteForm } from "../write-form"
import { useOfflineDetailsContext } from "./provider"

export const OfflineEditCard: FC = () => {
  const { offline } = useOfflineDetailsContext()
  const { canEditOffline } = useAuthorization()
  const canEdit = canEditOffline()
  const edit = useEditOfflineMutation()

  const FormComponent = useOfflineWriteForm({
    label: "Oppdater",
    disabled: !canEdit,
    onSubmit: async (data) => {
      edit.mutate({
        id: offline.id,
        input: data,
      })
    },
    defaultValues: offline,
  })

  return (
    <Stack>
      <FormComponent />
    </Stack>
  )
}
