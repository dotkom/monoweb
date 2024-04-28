import { Icon } from "@iconify/react"
import { Button } from "@mantine/core"
import { useRouter } from "next/navigation"
import type { FC } from "react"
import { useConfirmDeleteModal } from "src/components/molecules/ConfirmDeleteModal/confirm-delete-modal"
import { useDeleteInterestGroupMutation } from "src/modules/interest-group/mutations/use-delete-interest-group-mutation"
import { useUpdateInterestGroupMutation } from "src/modules/interest-group/mutations/use-update-interest-group-mutation"
import { useInterestGroupWriteForm } from "../write-form"
import { useInterestGroupDetailsContext } from "./provider"

export const InterestGroupEditCard: FC = () => {
  const { interestGroup } = useInterestGroupDetailsContext()
  const edit = useUpdateInterestGroupMutation()
  const remove = useDeleteInterestGroupMutation()
  const open = useConfirmDeleteModal({
    title: "Slett interessegruppe",
    text: `Er du sikker på at du vil slette ${interestGroup.name}?`,
    onConfirm: () => {
      remove.mutate(interestGroup.id)
      router.push("/interest-group/")
    },
  })
  const router = useRouter()
  const FormComponent = useInterestGroupWriteForm({
    label: "Oppdater interessegruppe",
    onSubmit: (data) => {
      edit.mutate({
        id: interestGroup.id,
        values: data,
      })
      router.push("/interest-group/")
    },
    defaultValues: interestGroup,
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
