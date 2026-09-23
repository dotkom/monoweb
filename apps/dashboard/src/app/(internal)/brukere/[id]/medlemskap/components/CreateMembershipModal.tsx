"use client"

import type { UserId } from "@dotkomonline/rpc/user"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogTitle } from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"
import { useCreateMembershipMutation } from "../../../mutations"
import { MembershipWriteForm } from "./MembershipWriteForm"

type CreateMembershipModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: UserId
}

export function CreateMembershipModal({ open, onOpenChange, userId }: CreateMembershipModalProps) {
  const createMembership = useCreateMembershipMutation()

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="md" onOutsideClick={() => onOpenChange(false)}>
        <div className="flex flex-row items-center justify-between gap-4">
          <AlertDialogTitle>Opprett medlemskap</AlertDialogTitle>
          <AlertDialogCancel type="button">
            <IconX className="size-5" />
          </AlertDialogCancel>
        </div>

        {open && (
          <MembershipWriteForm
            onSubmit={(data) => {
              createMembership.mutate({
                userId,
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
