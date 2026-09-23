"use client"

import type { GroupRole } from "@dotkomonline/rpc/group"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogTitle } from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"
import { useUpdateGroupRoleMutation } from "@/app/(internal)/grupper/mutations"
import { GroupRoleWriteForm } from "./GroupRoleWriteForm"

type EditGroupRoleModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: GroupRole | null
  disabled?: boolean
}

export function EditGroupRoleModal({ open, onOpenChange, role, disabled }: EditGroupRoleModalProps) {
  const update = useUpdateGroupRoleMutation()

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="md" onOutsideClick={() => onOpenChange(false)}>
        <div className="flex flex-row items-center justify-between gap-4">
          <AlertDialogTitle>Endre rolle</AlertDialogTitle>
          <AlertDialogCancel type="button">
            <IconX className="size-5" />
          </AlertDialogCancel>
        </div>

        {open && role && (
          <GroupRoleWriteForm
            defaultValues={role}
            onSubmit={(data) => {
              update.mutate({
                id: role.id,
                role: {
                  ...data,
                  groupId: role.groupId,
                },
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
