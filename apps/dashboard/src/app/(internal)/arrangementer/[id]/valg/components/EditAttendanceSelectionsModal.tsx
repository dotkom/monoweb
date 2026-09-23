"use client"

import type { Attendance, AttendanceSelection } from "@dotkomonline/rpc/attendance"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogTitle } from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"
import { useUpdateAttendanceMutation } from "@/app/(internal)/arrangementer/mutations"
import { SelectionsForm, type SelectionsFormValues } from "./SelectionForm"

type EditAttendanceSelectionsModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  attendance: Attendance
  existingSelection: AttendanceSelection
}

export function EditAttendanceSelectionsModal({
  open,
  onOpenChange,
  attendance,
  existingSelection,
}: EditAttendanceSelectionsModalProps) {
  const edit = useUpdateAttendanceMutation()
  const allSelections = attendance.selections || []

  const defaultAlternatives = {
    selection: existingSelection.name,
    alternatives: existingSelection.options.map((option) => ({
      value: option.name,
    })),
  }

  const onSubmit = (data: SelectionsFormValues) => {
    const newSelections = allSelections.map((selection) => {
      if (selection.id === existingSelection.id) {
        return {
          id: selection.id,
          name: data.selection,
          options: data.alternatives.map((alternative, i) => ({
            id: `${i}`,
            name: alternative.value,
          })),
        }
      }
      return selection
    })

    edit.mutate({
      id: attendance.id,
      attendance: { selections: newSelections },
    })

    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="md" onOutsideClick={() => onOpenChange(false)}>
        <div className="flex flex-row items-center justify-between gap-4">
          <AlertDialogTitle>Endre valg</AlertDialogTitle>
          <AlertDialogCancel type="button">
            <IconX className="size-5" />
          </AlertDialogCancel>
        </div>

        {open && <SelectionsForm onSubmit={onSubmit} defaultAlternatives={defaultAlternatives} />}
      </AlertDialogContent>
    </AlertDialog>
  )
}
