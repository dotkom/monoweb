"use client"

import type { Group } from "@dotkomonline/rpc/group"
import { DialogBody, DialogHeader, Dialog, DialogClose, DialogContent, DialogTitle } from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"
import { useCreateGroupRoleMutation } from "@admin/grupper/mutations"
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader className="flex flex-row items-center justify-between gap-4">
          <DialogTitle>Lag en ny rolle</DialogTitle>
          <DialogClose type="button">
            <IconX className="size-5" />
          </DialogClose>
        </DialogHeader>
        <DialogBody>
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
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
