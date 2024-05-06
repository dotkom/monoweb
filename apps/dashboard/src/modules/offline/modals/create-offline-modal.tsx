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
        fileAssetKey: data.fileAssetKey,
        imageId: data.image.id,
        title: data.title,
        published: data.published,
      })
      close()
    },
    defaultValues: {
      image: {
        id: "01HX71J61P58FHHQ8TGZ3ZMZAF",
        altText: "test",
        assetKey: "2b8f47bd-ff45-4b0f-b5d7-83b886899100img2.jpeg",
        crop: {
          top: 69.03125,
          left: 33.9921875,
          width: 266.7578125,
          height: 254.35546875,
        },
      },
    },
  })
  return <FormComponent />
}

export const useCreateOfflineModal = () => () =>
  modals.openContextModal({
    modal: "offline/create",
    title: "Opprett ny Offline",
    innerProps: {},
    size: "lg",
  })
