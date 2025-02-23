import type { Attendance, AttendanceSelection } from "@dotkomonline/types"
import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { useUpdateAttendanceMutation } from "src/modules/attendance/mutations/use-attendance-mutations"
import { SelectionsForm, type SelectionsFormValues } from "../../../components/molecules/SelectionsForm/SelectionsForm"

export const UpdateAttendanceSelectionsModal: FC<
  ContextModalProps<{ existingSelection: AttendanceSelection; attendance: Attendance }>
> = ({ context, id, innerProps: { attendance, existingSelection } }) => {
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

    context.closeModal(id)
  }

  return <SelectionsForm onSubmit={onSubmit} defaultAlternatives={defaultAlternatives} />
}

export const useEditSelectionsModal =
  ({ attendance }: { attendance: Attendance }) =>
  (existingSelection: AttendanceSelection) =>
    modals.openContextModal({
      modal: "attendance/selections/update",
      title: "Endre selection",
      innerProps: {
        attendance,
        existingSelection,
      },
    })
