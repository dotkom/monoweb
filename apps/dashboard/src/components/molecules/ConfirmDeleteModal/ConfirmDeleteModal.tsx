"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="md" onOutsideClick={() => onOpenChange(false)}>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        <AlertDialogFooter>
          <AlertDialogCancel type="button" variant="secondary">
            <IconCancel className="size-4" />
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            destructive
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            <IconTrash className="size-4" />
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
