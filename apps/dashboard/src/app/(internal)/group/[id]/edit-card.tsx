import { useConfirmDeleteModal } from "@/components/molecules/ConfirmDeleteModal/confirm-delete-modal"
import { Button } from "@mantine/core"
import { IconTrash } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import type { FC } from "react"
import { useDeleteGroupMutation, useUpdateGroupMutation } from "../mutations"
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
      remove.mutate(group.slug)
      router.push("/group/")
    },
  })

  const router = useRouter()
  const FormComponent = useGroupWriteForm({
    label: "Oppdater gruppe",
    onSubmit: (data) => {
      edit.mutate({
        id: group.slug,
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
        <IconTrash />
      </Button>
    </div>
  )
}
