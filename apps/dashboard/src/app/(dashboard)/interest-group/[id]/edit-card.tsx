import { type FC } from "react"
import { useInterestGroupDetailsContext } from "./provider"
import { useInterestGroupWriteForm } from "../write-form"
import { useUpdateInterestGroupMutation } from "src/modules/interest-group/mutations/use-update-interest-group-mutation"
import { useDeleteInterestGroupMutation } from "src/modules/interest-group/mutations/use-delete-interest-group-mutation"
import { Button, Checkbox, Stack } from "@mantine/core"
import { Icon } from "@iconify/react"
import { useRouter } from "next/navigation"
import { useConfirmDeleteModal } from "src/components/molecules/ConfirmDeleteModal/confirm-delete-modal"

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
    <Stack gap="xs">
      <FormComponent />
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center" }}>
        <Button variant="outline" color="red" style={{ width: "55px", marginRight: "24px" }} onClick={open}>
          <Icon icon="tabler:trash" />
        </Button>
        <Checkbox
          label="Aktiv?"
          onChange={() =>
            edit.mutate({
              id: interestGroup.id,
              values: {
                name: interestGroup.name,
                description: interestGroup.description,
                link: interestGroup.link,
                isActive: !interestGroup.isActive,
              },
            })
          }
          checked={interestGroup.isActive}
        />
      </div>
    </Stack>
  )
}
