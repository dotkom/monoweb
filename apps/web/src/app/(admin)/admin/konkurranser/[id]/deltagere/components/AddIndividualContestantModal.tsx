"use client"

import { UserSearch } from "@admin/brukere/components/UserSearch"
import type { User } from "@dotkomonline/rpc/user"
import { DialogBody, DialogHeader, Dialog, DialogClose, DialogContent, DialogTitle } from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"

type AddIndividualContestantModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  excludeUserIds: string[]
  disabled?: boolean
  onSubmit: (user: User) => void
}

export function AddIndividualContestantModal({
  open,
  onOpenChange,
  excludeUserIds,
  disabled,
  onSubmit,
}: AddIndividualContestantModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader className="flex flex-row items-center justify-between gap-4">
          <DialogTitle>Legg til individ</DialogTitle>
          <DialogClose type="button">
            <IconX className="size-5" />
          </DialogClose>
        </DialogHeader>
        <DialogBody>
          <UserSearch
            disabled={disabled}
            excludeUserIds={excludeUserIds}
            onSubmit={(user) => {
              onSubmit(user)
              onOpenChange(false)
            }}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
