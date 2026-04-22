import type { Attendance } from "@dotkomonline/types"
import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { useUpdateAttendanceMutation } from "../mutations"
import { SelectionsForm, type SelectionsFormValues } from "./selection-form"

export const CreateAttendanceSelectionsModal: FC<ContextModalProps<{ attendance: Attendance }>> = ({
  context,
  id,
  innerProps,
}) => {
  const edit = useUpdateAttendanceMutation()
  const allSelections = innerProps.attendance.selections || []

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
      id: innerProps.attendance.id,
      attendance: {
        selections: newSelections,
      },
    })

    context.closeModal(id)
  }

  return <SelectionsForm onSubmit={onSubmit} defaultAlternatives={defaultAlternatives} />
}

export const useCreateAttendanceSelectionsModal =
  ({ attendance }: { attendance: Attendance }) =>
  () =>
    modals.openContextModal({
      modal: "attendance/selections/create",
      title: "Legg til nytt deltakervalg",
      innerProps: {
        attendance,
      },
    })
