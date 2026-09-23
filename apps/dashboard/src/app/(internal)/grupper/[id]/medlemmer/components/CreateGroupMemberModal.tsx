"use client"

import type { Group } from "@dotkomonline/rpc/group"
import type { UserId } from "@dotkomonline/rpc/user"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogTitle } from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"
import { useStartGroupMembershipMutation } from "@/app/(internal)/grupper/mutations"
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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="md" onOutsideClick={() => onOpenChange(false)}>
        <div className="flex flex-row items-center justify-between gap-4">
          <AlertDialogTitle>Legg til bruker</AlertDialogTitle>
          <AlertDialogCancel type="button">
            <IconX className="size-5" />
          </AlertDialogCancel>
        </div>

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
      </AlertDialogContent>
    </AlertDialog>
  )
}
