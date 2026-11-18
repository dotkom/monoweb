"use client"

import type { UserId } from "@dotkomonline/rpc/user"
import { Dialog, DialogBody, DialogClose, DialogContent, DialogTitle } from "@dotkomonline/ui"
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <div className="flex shrink-0 flex-row items-center justify-between gap-4">
          <DialogTitle>Opprett medlemskap</DialogTitle>
          <DialogClose type="button">
            <IconX className="size-5" />
          </DialogClose>
        </div>

        <DialogBody>
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
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
