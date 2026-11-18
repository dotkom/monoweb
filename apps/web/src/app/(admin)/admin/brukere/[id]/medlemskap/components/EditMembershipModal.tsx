"use client"

import type { Membership } from "@dotkomonline/rpc/user"
import { Dialog, DialogBody, DialogClose, DialogContent, DialogTitle } from "@dotkomonline/ui"
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <div className="flex shrink-0 flex-row items-center justify-between gap-4">
          <DialogTitle>Rediger medlemskap</DialogTitle>
          <DialogClose type="button">
            <IconX className="size-5" />
          </DialogClose>
        </div>

        <DialogBody>
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
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
