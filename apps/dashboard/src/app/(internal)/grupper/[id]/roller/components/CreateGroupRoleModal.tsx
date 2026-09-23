"use client"

import type { Group } from "@dotkomonline/rpc/group"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogTitle } from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"
import { useCreateGroupRoleMutation } from "@/app/(internal)/grupper/mutations"
import { GroupRoleWriteForm } from "./GroupRoleWriteForm"

type CreateGroupRoleModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: Group
  disabled?: boolean
}

export function CreateGroupRoleModal({ open, onOpenChange, group, disabled }: CreateGroupRoleModalProps) {
  const create = useCreateGroupRoleMutation()

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="md" onOutsideClick={() => onOpenChange(false)}>
        <div className="flex flex-row items-center justify-between gap-4">
          <AlertDialogTitle>Lag en ny rolle</AlertDialogTitle>
          <AlertDialogCancel type="button">
            <IconX className="size-5" />
          </AlertDialogCancel>
        </div>

        {open && (
          <GroupRoleWriteForm
            onSubmit={(data) => {
              create.mutate({
                ...data,
                groupId: group.slug,
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
