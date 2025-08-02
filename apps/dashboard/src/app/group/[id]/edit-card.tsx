import { useConfirmDeleteModal } from "@/components/molecules/ConfirmDeleteModal/confirm-delete-modal"
import { Icon } from "@iconify/react"
import { Button } from "@mantine/core"
import { useRouter } from "next/navigation"
import type { FC } from "react"
import { useGroupWriteForm } from "../write-form"
import { useGroupDetailsContext } from "./provider"
import { useUpdateGroupMutation, useDeleteGroupMutation } from "../mutations"

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
        <Icon icon="tabler:trash" />
      </Button>
    </div>
  )
}
