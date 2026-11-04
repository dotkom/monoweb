"use client"

import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogTitle } from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"
import { MarkWriteForm } from "./MarkWriteForm"
import { useCreateMarkMutation } from "./mutations"

type CreateSuspensionModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateSuspensionModal({ open, onOpenChange }: CreateSuspensionModalProps) {
  const create = useCreateMarkMutation()

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="lg" onOutsideClick={() => onOpenChange(false)}>
        <div className="flex flex-row items-center justify-between gap-4">
          <AlertDialogTitle>Opprett ny suspensjon</AlertDialogTitle>
          <AlertDialogCancel type="button">
            <IconX className="size-5" />
          </AlertDialogCancel>
        </div>

        {open && (
          <MarkWriteForm
            suspension
            submitLabel="Gi suspensjon"
            onSubmit={(mark) => {
              create.mutate({
                data: {
                  ...mark,
                  weight: 6,
                  type: "MANUAL",
                },
                groupIds: mark.groupIds,
              })
              onOpenChange(false)
            }}
          />
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
