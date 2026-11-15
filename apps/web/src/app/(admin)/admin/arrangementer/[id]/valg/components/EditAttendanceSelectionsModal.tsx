"use client"

import type { Attendance, AttendanceSelection } from "@dotkomonline/rpc/attendance"
import { DialogBody, DialogHeader, Dialog, DialogClose, DialogContent, DialogTitle } from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"
import { useUpdateAttendanceMutation } from "@admin/arrangementer/mutations"
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader className="flex flex-row items-center justify-between gap-4">
          <DialogTitle>Endre valg</DialogTitle>
          <DialogClose type="button">
            <IconX className="size-5" />
          </DialogClose>
        </DialogHeader>
        <DialogBody>
          {open && <SelectionsForm onSubmit={onSubmit} defaultAlternatives={defaultAlternatives} />}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
