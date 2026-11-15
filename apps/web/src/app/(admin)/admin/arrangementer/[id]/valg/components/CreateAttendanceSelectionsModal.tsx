"use client"

import { useUpdateAttendanceMutation } from "@admin/arrangementer/mutations"
import type { Attendance } from "@dotkomonline/rpc/attendance"
import { DialogBody, DialogHeader, Dialog, DialogClose, DialogContent, DialogTitle } from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"
import { SelectionsForm, type SelectionsFormValues } from "../components/SelectionForm"

type CreateAttendanceSelectionsModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  attendance: Attendance
}

export function CreateAttendanceSelectionsModal({
  open,
  onOpenChange,
  attendance,
}: CreateAttendanceSelectionsModalProps) {
  const edit = useUpdateAttendanceMutation()
  const allSelections = attendance.selections || []

  const defaultAlternatives: SelectionsFormValues = {
    selection: "",
    alternatives: [{ value: "" }],
  }

  const onSubmit = (data: SelectionsFormValues) => {
    const newSelections = [
      ...allSelections,
      {
        id: `${allSelections.length}`,
        name: data.selection,
        options: data.alternatives.map((alternative, i) => ({
          id: `${i}`,
          name: alternative.value,
        })),
      },
    ]

    edit.mutate({
      id: attendance.id,
      attendance: {
        selections: newSelections,
      },
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader className="flex flex-row items-center justify-between gap-4">
          <DialogTitle>Legg til nytt deltakervalg</DialogTitle>
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
