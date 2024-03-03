import { ContextModalProps, modals } from "@mantine/modals"
import { FC } from "react"
import { useDeleteInterestGroupMutation } from "../mutations/use-delete-interest-group-mutation"
import { Box, Button, Text } from "@mantine/core"
import { useRouter } from "next/navigation"

export const DeleteInterestGroupModal: FC<
  ContextModalProps<{
    interestGroupId: string
  }>
> = ({ context, id, innerProps }) => {
  const close = () => context.closeModal(id)
  const remove = useDeleteInterestGroupMutation()
  const router = useRouter()
  const { interestGroupId } = innerProps
  return (
    <Box>
      <Text c="red" mb={20} fw={700}>
        Are you sure you want to delete this interest group?
      </Text>
      <Button
        variant="outline"
        color="red"
        onClick={() => {
          remove.mutate(interestGroupId)
          close()
          router.push("/interest-group")
        }}
      >
        Delete
      </Button>
    </Box>
  )
}

export const useDeleteInterestGroupModal = (interestGroupId: string) => () => {
  return modals.openContextModal({
    modal: "interestGroup/delete",
    title: "Delete interest group",
    innerProps: { interestGroupId },
  })
}
