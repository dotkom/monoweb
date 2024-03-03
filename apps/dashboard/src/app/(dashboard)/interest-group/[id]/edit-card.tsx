import { type FC } from "react"
import { useInterestGroupDetailsContext } from "./provider"
import { useInterestGroupWriteForm } from "../write-form"
import { useUpdateInterestGroupMutation } from "src/modules/interest-group/mutations/use-update-interest-group-mutation"
import { useDeleteInterestGroupMutation } from "src/modules/interest-group/mutations/use-delete-interest-group-mutation"
import { useDeleteInterestGroupModal } from "src/modules/interest-group/modals/confirm-delete-modal"
import { Button } from "@mantine/core"
import { Icon } from "@iconify/react"

export const InterestGroupEditCard: FC = () => {
  const { interestGroup } = useInterestGroupDetailsContext()
  const edit = useUpdateInterestGroupMutation()
  const open = useDeleteInterestGroupModal(interestGroup.id)
  const FormComponent = useInterestGroupWriteForm({
    label: "Oppdater interessegruppe",
    onSubmit: (data) => {
      edit.mutate({
        id: interestGroup.id,
        values: data,
      })
    },
    defaultValues: interestGroup,
  })
  return (
    <div>
      <FormComponent />
      <Button variant="outline" color="red" style={{ marginTop: "1rem" }} onClick={open}>
        <Icon icon="tabler:trash" />
      </Button>
    </div>
  )
}
