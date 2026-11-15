"use client"

import { DialogBody, DialogHeader, Dialog, DialogClose, DialogContent, DialogTitle } from "@dotkomonline/ui"
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader className="flex flex-row items-center justify-between gap-4">
          <DialogTitle>Opprett ny suspensjon</DialogTitle>
          <DialogClose type="button">
            <IconX className="size-5" />
          </DialogClose>
        </DialogHeader>
        <DialogBody>
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
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
