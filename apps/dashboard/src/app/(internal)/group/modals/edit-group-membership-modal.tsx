import type { GroupMembership } from "@dotkomonline/types"
import { Stack, Text } from "@mantine/core"
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

  const membershipIsActive = groupMembership.end === null

  const FormComponent = useGroupMembershipForm({
    allowEditEndDate: !membershipIsActive,
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
  return (
    <Stack>
      {membershipIsActive && (
        <Text c="red" size="md">
          Kun rediger aktivt medlemskap hvis noe er feil. For å legge til nye roller, avslutt nåværende og lag nytt
          medlemskap.
        </Text>
      )}
      <FormComponent />
    </Stack>
  )
}

export const useEditGroupMembershipModal =
  () =>
  ({ groupMembership }: { groupMembership: GroupMembership }) => {
    return modals.openContextModal({
      modal: "group/membership/update",
      title: "Endre medlemskap",
      innerProps: { groupMembership },
    })
  }
