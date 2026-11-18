"use client"

import type { Group } from "@dotkomonline/rpc/group"
import type { UserId } from "@dotkomonline/rpc/user"
import { DialogBody, DialogHeader, Dialog, DialogClose, DialogContent, DialogTitle } from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"
import { useStartGroupMembershipMutation } from "@admin/grupper/mutations"
import { GroupMemberWriteForm } from "./GroupMemberWriteForm"

type CreateGroupMemberModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: Group
  userId: UserId | null
  disabled?: boolean
}

export function CreateGroupMemberModal({ open, onOpenChange, group, userId, disabled }: CreateGroupMemberModalProps) {
  const startMembership = useStartGroupMembershipMutation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader className="flex flex-row items-center justify-between gap-4">
          <DialogTitle>Legg til bruker</DialogTitle>
          <DialogClose type="button">
            <IconX className="size-5" />
          </DialogClose>
        </DialogHeader>
        <DialogBody>
          {open && userId && (
            <GroupMemberWriteForm
              groupId={group.slug}
              onSubmit={(data) => {
                startMembership.mutate({
                  userId,
                  groupId: group.slug,
                  roleIds: data.roleIds,
                })
                onOpenChange(false)
              }}
              disabled={disabled}
            />
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
