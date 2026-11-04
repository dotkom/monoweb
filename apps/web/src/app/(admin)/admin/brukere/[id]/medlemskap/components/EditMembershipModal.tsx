"use client"

import type { Membership } from "@dotkomonline/rpc/user"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogTitle } from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"
import { useUpdateMembershipMutation } from "../../../mutations"
import { MembershipWriteForm } from "./MembershipWriteForm"

type EditMembershipModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  membership: Membership | null
}

export function EditMembershipModal({ open, onOpenChange, membership }: EditMembershipModalProps) {
  const updateMembership = useUpdateMembershipMutation()

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="md" onOutsideClick={() => onOpenChange(false)}>
        <div className="flex flex-row items-center justify-between gap-4">
          <AlertDialogTitle>Rediger medlemskap</AlertDialogTitle>
          <AlertDialogCancel type="button">
            <IconX className="size-5" />
          </AlertDialogCancel>
        </div>

        {open && membership && (
          <MembershipWriteForm
            defaultValues={membership}
            onSubmit={(data) => {
              updateMembership.mutate({
                membershipId: membership.id,
                data,
              })
              onOpenChange(false)
            }}
          />
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
