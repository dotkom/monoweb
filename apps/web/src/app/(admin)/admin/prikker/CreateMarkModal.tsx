"use client"

import { DialogBody, DialogHeader, Dialog, DialogClose, DialogContent, DialogTitle } from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"
import { MarkWriteForm } from "./MarkWriteForm"
import { useCreateMarkMutation } from "./mutations"

type CreateMarkModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateMarkModal({ open, onOpenChange }: CreateMarkModalProps) {
  const create = useCreateMarkMutation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader className="flex flex-row items-center justify-between gap-4">
          <DialogTitle>Opprett ny prikk</DialogTitle>
          <DialogClose type="button">
            <IconX className="size-5" />
          </DialogClose>
        </DialogHeader>
        <DialogBody>
          {open && (
            <MarkWriteForm
              submitLabel="Gi prikk"
              onSubmit={({ title, details, duration, weight, groupIds }) => {
                create.mutate({
                  data: {
                    title,
                    details,
                    weight,
                    type: "MANUAL",
                    duration,
                  },
                  groupIds,
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
