"use client"

import type { GroupRole } from "@dotkomonline/rpc/group"
import { DialogBody, DialogHeader, Dialog, DialogClose, DialogContent, DialogTitle } from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"
import { useUpdateGroupRoleMutation } from "@admin/grupper/mutations"
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader className="flex flex-row items-center justify-between gap-4">
          <DialogTitle>Endre rolle</DialogTitle>
          <DialogClose type="button">
            <IconX className="size-5" />
          </DialogClose>
        </DialogHeader>
        <DialogBody>
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
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
