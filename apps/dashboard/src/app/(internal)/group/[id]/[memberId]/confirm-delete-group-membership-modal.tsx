import { useConfirmDeleteModal } from "@/components/molecules/ConfirmDeleteModal/confirm-delete-modal"
import type { GroupMembership } from "@dotkomonline/types"
import { useDeleteGroupMembershipMutation } from "../../mutations"

export const useConfirmDeleteGroupMembershipModal = () => {
  const deleteMembership = useDeleteGroupMembershipMutation()

  return ({ groupMembership }: { groupMembership: GroupMembership }) => {
    return useConfirmDeleteModal({
      title: "Slett gruppemedlemskap",
      text: "Er du sikker på at du vil slette dette gruppemedlemskapet?",
      confirmText: "Slett gruppemedlemskap",
      cancelText: "Avbryt",
      onConfirm: () => {
        deleteMembership.mutate(groupMembership.id)
      },
    })
  }
}
