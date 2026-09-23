"use client"

import { useUpdateAttendanceMutation } from "@/app/(internal)/arrangementer/mutations"
import type { Attendance } from "@dotkomonline/rpc/attendance"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogTitle } from "@dotkomonline/ui"
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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="md" onOutsideClick={() => onOpenChange(false)}>
        <div className="flex flex-row items-center justify-between gap-4">
          <AlertDialogTitle>Legg til nytt deltakervalg</AlertDialogTitle>
          <AlertDialogCancel type="button">
            <IconX className="size-5" />
          </AlertDialogCancel>
        </div>

        {open && <SelectionsForm onSubmit={onSubmit} defaultAlternatives={defaultAlternatives} />}
      </AlertDialogContent>
    </AlertDialog>
  )
}
