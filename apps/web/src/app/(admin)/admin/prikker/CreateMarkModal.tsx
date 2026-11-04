"use client"

import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogTitle } from "@dotkomonline/ui"
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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="lg" onOutsideClick={() => onOpenChange(false)}>
        <div className="flex flex-row items-center justify-between gap-4">
          <AlertDialogTitle>Opprett ny prikk</AlertDialogTitle>
          <AlertDialogCancel type="button">
            <IconX className="size-5" />
          </AlertDialogCancel>
        </div>

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
      </AlertDialogContent>
    </AlertDialog>
  )
}
