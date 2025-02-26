import { Icon } from "@iconify/react"
import { Button } from "@mantine/core"
import { useRouter } from "next/navigation"
import type { FC } from "react"
import { useConfirmDeleteModal } from "src/components/molecules/ConfirmDeleteModal/confirm-delete-modal"
import { useDeleteGroupMutation } from "src/modules/group/mutations/use-delete-group-mutation"
import { useUpdateGroupMutation } from "src/modules/group/mutations/use-update-group-mutation"
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

  const router = useRouter()
  const FormComponent = useGroupWriteForm({
    label: "Oppdater gruppe",
    onSubmit: (data) => {
      edit.mutate({
        id: group.id,
        values: data,
      })
      router.push("/group/")
    },
    defaultValues: group,
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
