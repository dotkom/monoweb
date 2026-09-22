"use client"

import { UserSearch } from "@/app/(internal)/brukere/components/UserSearch"
import type { User } from "@dotkomonline/rpc/user"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogTitle } from "@dotkomonline/ui"
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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="md" onOutsideClick={() => onOpenChange(false)}>
        <div className="flex flex-row items-center justify-between gap-4">
          <AlertDialogTitle>Legg til individ</AlertDialogTitle>
          <AlertDialogCancel type="button">
            <IconX className="size-5" />
          </AlertDialogCancel>
        </div>

        <UserSearch
          disabled={disabled}
          excludeUserIds={excludeUserIds}
          onSubmit={(user) => {
            onSubmit(user)
            onOpenChange(false)
          }}
        />
      </AlertDialogContent>
    </AlertDialog>
  )
}
