import type { Group, UserId } from "@dotkomonline/types"
import { getCurrentUtc } from "@dotkomonline/utils"
import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { useGroupMemberForm } from "../group-member-form"
import { useStartMembershipMutation } from "../mutations"
export const CreateGroupMemberModal: FC<ContextModalProps<{ group: Group; userId: UserId }>> = ({
  context,
  id,
  innerProps: { group, userId },
}) => {
  const close = () => context.closeModal(id)
  const create = useStartMembershipMutation()
  const FormComponent = useGroupMemberForm({
    groupId: group.slug,
    onSubmit: (data) => {
      create.mutate({
        data: {
          start: getCurrentUtc(),
          userId: userId,
          groupId: group.slug,
          end: null,
        },
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
