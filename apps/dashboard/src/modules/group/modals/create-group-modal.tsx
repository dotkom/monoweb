import type { GroupWrite } from "@dotkomonline/types"
import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { useGroupWriteForm } from "src/app/(dashboard)/group/write-form"
import { useQueryNotification } from "src/app/notifications"
import { useS3UploadFile } from "src/modules/offline/use-s3-upload-file"
import { useCreateGroupMutation } from "../mutations/use-create-group-mutation"

export const CreateGroupModal: FC<ContextModalProps> = ({ context, id }) => {
  const close = () => context.closeModal(id)
  const create = useCreateGroupMutation()

  const notification = useQueryNotification()
  const upload = useS3UploadFile()
  const handleUpload = async (file?: File) => (file?.name ? await upload(file) : null)

  const FormComponent = useGroupWriteForm({
    onSubmit: (data) => {
      let imageUrl = null

      handleUpload(data.image)
        .then((uploadedImage) => {
          imageUrl = uploadedImage

          const groupToCreate: GroupWrite = {
            name: data.name,
            description: data.description,
            email: data.email,
            type: data.type,
            image: imageUrl,
          }

          create.mutate({
            ...groupToCreate,
          })
        })
        .catch((e) => {
          notification.fail({ message: "Kunne ikke laste opp bilde", title: "Feil" })
        })

      close()
    },
  })
  return <FormComponent />
}

export const useCreateGroupModal = () => () => {
  return modals.openContextModal({
    modal: "group/create",
    title: "Lag en ny gruppe",
    innerProps: {},
  })
}
