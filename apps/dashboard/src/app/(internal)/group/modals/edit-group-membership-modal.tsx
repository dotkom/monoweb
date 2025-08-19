import type { GroupMembership } from "@dotkomonline/types"
import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { useGroupMembershipForm } from "../[id]/[memberId]/group-membership-form"
import { useUpdateGroupMembershipMutation } from "../mutations"

export const EditGroupMembershipModal: FC<ContextModalProps<{ groupMembership: GroupMembership }>> = ({
  context,
  id,
  innerProps: { groupMembership },
}) => {
  const close = () => context.closeModal(id)
  const update = useUpdateGroupMembershipMutation()
  const FormComponent = useGroupMembershipForm({
    groupId: groupMembership.groupId,
    defaultValues: {
      roleIds: groupMembership.roles.map((role) => role.id),
      start: groupMembership.start,
      end: groupMembership.end,
    },
    onSubmit: (data) => {
      update.mutate({
        id: groupMembership.id,
        data: {
          userId: groupMembership.userId,
          groupId: groupMembership.groupId,
          ...data,
        },
        roleIds: data.roleIds,
      })
      close()
    },
  })
  return <FormComponent />
}

export const useEditGroupMembershipModal =
  () =>
  ({ groupMembership }: { groupMembership: GroupMembership }) => {
    return modals.openContextModal({
      modal: "group/membership/update",
      title: "Endre tidligere medlemskap",
      innerProps: { groupMembership },
    })
  }
