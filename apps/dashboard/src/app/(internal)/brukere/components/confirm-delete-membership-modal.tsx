import { useConfirmDeleteModal } from "@/components/molecules/ConfirmDeleteModal/confirm-delete-modal"
import type { Membership } from "@dotkomonline/rpc/user"
import { useDeleteMembershipMutation } from "../mutations"

export const useConfirmDeleteMembershipModal = () => {
  const deleteMembership = useDeleteMembershipMutation()

  return ({ membership }: { membership: Membership }) => {
    // biome-ignore lint/correctness/useHookAtTopLevel: TODO: this is a bug and should be fixed
    return useConfirmDeleteModal({
      title: "Slett medlemskap",
      text: "Er du sikker på at du vil slette dette medlemskapet?",
      confirmText: "Slett medlemskap",
      cancelText: "Avbryt",
      onConfirm: () => {
        deleteMembership.mutate({ membershipId: membership.id })
      },
    })
  }
}
