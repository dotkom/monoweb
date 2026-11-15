"use client"

import {
  DialogBody,
  Dialog,
  Button,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@dotkomonline/ui"
import { IconCancel, IconTrash } from "@tabler/icons-react"
import type { ReactNode } from "react"

export type ConfirmDeleteModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: ReactNode
  onConfirm: () => void
  confirmLabel?: string
  cancelLabel?: string
}

export function ConfirmDeleteModal({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmLabel = "Ja, slett",
  cancelLabel = "Nei",
}: ConfirmDeleteModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogTitle>{title}</DialogTitle>
        <DialogBody>{description && <DialogDescription>{description}</DialogDescription>}</DialogBody>
        <DialogFooter className="-mx-5 -mb-5 rounded-b-2xl p-5 sm:-mx-6 sm:-mb-6 sm:p-6">
          <DialogClose type="button" variant="secondary">
            <IconCancel className="size-4" />
            {cancelLabel}
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            <IconTrash className="size-4" />
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
