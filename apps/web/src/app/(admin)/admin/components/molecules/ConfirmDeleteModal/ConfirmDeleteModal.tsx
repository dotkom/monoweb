"use client"

import { closeOnlyOnChoice } from "@admin/lib/confirm-dialog"
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

export type ConfirmModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: ReactNode
  onConfirm: () => void
  confirmLabel: string
  confirmIcon?: ReactNode
  cancelLabel?: string
  destructive?: boolean
  size?: "sm" | "md"
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmLabel,
  confirmIcon,
  cancelLabel = "Nei",
  destructive = false,
  size = "md",
}: ConfirmModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={closeOnlyOnChoice(onOpenChange)}>
      <AlertDialogContent size={size}>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        <AlertDialogFooter>
          <AlertDialogCancel type="button" variant="secondary">
            <IconCancel className="size-4" />
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            destructive={destructive}
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            {confirmIcon}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export type ConfirmDeleteModalProps = Omit<ConfirmModalProps, "confirmLabel" | "confirmIcon" | "destructive"> & {
  confirmLabel?: string
}

export function ConfirmDeleteModal({ confirmLabel = "Ja, slett", ...props }: ConfirmDeleteModalProps) {
  return (
    <ConfirmModal {...props} confirmLabel={confirmLabel} confirmIcon={<IconTrash className="size-4" />} destructive />
  )
}
