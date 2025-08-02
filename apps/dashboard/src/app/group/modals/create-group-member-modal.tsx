import type { Group, UserId } from "@dotkomonline/types"
import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { useGroupMemberForm } from "../group-member-form"
import { useStartGroupMembershipMutation } from "../mutations"

export const CreateGroupMemberModal: FC<ContextModalProps<{ group: Group; userId: UserId }>> = ({
  context,
  id,
  innerProps: { group, userId },
}) => {
  const close = () => context.closeModal(id)
  const startMembership = useStartGroupMembershipMutation()
  const FormComponent = useGroupMemberForm({
    groupId: group.slug,
    onSubmit: (data) => {
      startMembership.mutate({
        userId: userId,
        groupId: group.slug,
        roleIds: data.roleIds,
      })
      close()
    },
  })
  return <FormComponent />
}

export const useCreateGroupMemberModal =
  ({ group }: { group: Group }) =>
  ({ userId }: { userId: UserId }) => {
    return modals.openContextModal({
      modal: "group/member/create",
      title: "Legg til bruker",
      innerProps: { group, userId },
    })
  }
