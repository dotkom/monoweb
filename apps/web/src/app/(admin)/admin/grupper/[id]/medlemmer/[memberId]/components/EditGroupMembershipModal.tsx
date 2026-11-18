"use client"

import { useUpdateGroupMembershipMutation } from "@admin/grupper/mutations"
import { isGroupMembershipActive, type GroupMembership } from "@dotkomonline/rpc/group"
import { DialogBody, DialogHeader, Dialog, DialogClose, DialogContent, DialogTitle, Text } from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"
import { GroupMembershipWriteForm } from "./GroupMembershipWriteForm"

type EditGroupMembershipModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupMembership: GroupMembership | null
}

export function EditGroupMembershipModal({ open, onOpenChange, groupMembership }: EditGroupMembershipModalProps) {
  const update = useUpdateGroupMembershipMutation()

  const isActive = groupMembership !== null && isGroupMembershipActive(groupMembership)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader className="flex flex-row items-center justify-between gap-4">
          <DialogTitle>Endre medlemskap</DialogTitle>
          <DialogClose type="button">
            <IconX className="size-5" />
          </DialogClose>
        </DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-4">
            {isActive && (
              <Text className="text-destructive">
                Kun rediger aktivt medlemskap hvis noe er feil. For å legge til nye roller, avslutt nåværende og lag
                nytt medlemskap.
              </Text>
            )}

            {open && groupMembership && (
              <GroupMembershipWriteForm
                allowEditEndDate={!isActive}
                groupId={groupMembership.groupId}
                defaultValues={{
                  roleIds: groupMembership.roles.map((role) => role.id),
                  start: groupMembership.start,
                  end: groupMembership.end,
                }}
                onSubmit={(data) => {
                  update.mutate({
                    id: groupMembership.id,
                    data: {
                      userId: groupMembership.userId,
                      groupId: groupMembership.groupId,
                      ...data,
                    },
                    roleIds: data.roleIds,
                  })
                  onOpenChange(false)
                }}
              />
            )}
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
