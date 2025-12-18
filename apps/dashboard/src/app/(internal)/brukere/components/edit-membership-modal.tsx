import type { Membership } from "@dotkomonline/types"
import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { useUpdateMembershipMutation } from "../mutations"
import { useMembershipWriteForm } from "./membership-form"

export const EditMembershipModal: FC<ContextModalProps<{ membership: Membership }>> = ({
  context,
  id,
  innerProps: { membership },
}) => {
  const close = () => context.closeModal(id)
  const updateMembership = useUpdateMembershipMutation()
  const FormComponent = useMembershipWriteForm({
    defaultValues: membership,
    onSubmit: (data) => {
      updateMembership.mutate({
        membershipId: membership.id,
        data,
      })
      close()
    },
  })
  return <FormComponent />
}

export const useEditMembershipModal =
  () =>
  ({ membership }: { membership: Membership }) => {
    return modals.openContextModal({
      modal: "user/membership/update",
      title: "Rediger medlemskap",
      innerProps: { membership },
    })
  }
