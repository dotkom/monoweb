import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { useOfflineWriteForm } from "../../../app/(dashboard)/offline/write-form"
import { useCreateOfflineMutation } from "../mutations/use-create-offline-mutation"

export const CreateOfflineModal: FC<ContextModalProps> = ({ context, id }) => {
  const close = () => context.closeModal(id)
  const createOffline = useCreateOfflineMutation()

  const FormComponent = useOfflineWriteForm({
    label: "Opprett ny Offline",
    onSubmit: async (data) => {
      createOffline.mutate({
        pdfAssetKey: data.pdfAssetKey,
        imageVariantId: data.image.id,
        title: data.title,
        published: data.published,
      })
      close()
    },
  })
  return <FormComponent />
}

export const useCreateOfflineModal = () => () =>
  modals.openContextModal({
    modal: "offline/create",
    title: "Opprett ny Offline",
    innerProps: {},
    size: "xl",
  })
