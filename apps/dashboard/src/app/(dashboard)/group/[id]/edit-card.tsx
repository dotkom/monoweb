import type { GroupWrite } from "@dotkomonline/types"
import { Icon } from "@iconify/react"
import { Button } from "@mantine/core"
import { useRouter } from "next/navigation"
import type { FC } from "react"
import { useQueryNotification } from "src/app/notifications"
import { useConfirmDeleteModal } from "src/components/molecules/ConfirmDeleteModal/confirm-delete-modal"
import { useDeleteGroupMutation } from "src/modules/group/mutations/use-delete-group-mutation"
import { useUpdateGroupMutation } from "src/modules/group/mutations/use-update-group-mutation"
import { useS3UploadFile } from "src/modules/offline/use-s3-upload-file"
import { useGroupWriteForm } from "../write-form"
import { useGroupDetailsContext } from "./provider"

export const GroupEditCard: FC = () => {
  const { group } = useGroupDetailsContext()
  const edit = useUpdateGroupMutation()
  const remove = useDeleteGroupMutation()

  const open = useConfirmDeleteModal({
    title: "Slett gruppe",
    text: `Er du sikker på at du vil slette ${group.name}?`,
    onConfirm: () => {
      remove.mutate(group.id)
      router.push("/group/")
    },
  })

  const notification = useQueryNotification()
  const upload = useS3UploadFile()
  const handleUpload = async (file?: File) => (file?.name ? await upload(file) : null)

  const router = useRouter()
  const FormComponent = useGroupWriteForm({
    label: "Oppdater gruppe",
    onSubmit: async (data) => {
      let imageUrl = null

      try {
        imageUrl = await handleUpload(data.image)
      } catch (e) {
        notification.fail({
          message: "Kunne ikke laste opp bilde",
          title: "Feil",
        })
      }

      const groupToUpdate: GroupWrite = {
        name: data.name,
        description: data.description,
        email: data.email,
        type: data.type,
        image: imageUrl,
      }

      edit.mutate({
        id: group.id,
        values: groupToUpdate,
      })
      router.push("/group/")
    },
    defaultValues: { ...group, imageUrl: group.image ?? null },
  })
  return (
    <div>
      <FormComponent />
      <Button variant="outline" color="red" mt="sm" onClick={open}>
        <Icon icon="tabler:trash" />
      </Button>
    </div>
  )
}
