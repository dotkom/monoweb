import type { Membership } from "@dotkomonline/types"
import { useConfirmDeleteModal } from "@/components/molecules/ConfirmDeleteModal/confirm-delete-modal"
import { useDeleteMembershipMutation } from "../mutations"

export const useConfirmDeleteMembershipModal = () => {
  const deleteMembership = useDeleteMembershipMutation()

  return ({ membership }: { membership: Membership }) => {
    // biome-ignore lint/correctness/useHookAtTopLevel: TODO: This is a horrible bug in the codebase that must be fixed
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
