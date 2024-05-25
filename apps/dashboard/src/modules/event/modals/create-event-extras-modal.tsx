import type { Attendance } from "@dotkomonline/types"
import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { ExtrasForm, type ExtrasFormValues } from "../../../components/molecules/extras-form/ExtrasForm"
import { useUpdateExtrasMutation } from "../../attendance/mutations/use-attendance-mutations"

export const CreateAttendanceExtrasModal: FC<ContextModalProps<{ attendance: Attendance }>> = ({
  context,
  id,
  innerProps,
}) => {
  const edit = useUpdateExtrasMutation()
  const allExtras = innerProps.attendance.extras || []

  const defaultAlternatives: ExtrasFormValues = {
    question: "",
    alternatives: [{ value: "" }],
  }

  const onSubmit = (data: ExtrasFormValues) => {
    const newExtras = [
      ...allExtras,
      {
        id: `${allExtras.length}`,
        name: data.question,
        choices: data.alternatives.map((alternative, i) => ({
          id: `${i}`,
          name: alternative.value,
        })),
      },
    ]

    edit.mutate({
      id: innerProps.attendance.id,
      extras: newExtras,
    })

    context.closeModal(id)
  }

  return <ExtrasForm onSubmit={onSubmit} defaultAlternatives={defaultAlternatives} />
}

export const useCreateAttendanceExtrasModal =
  ({ attendance }: { attendance: Attendance }) =>
  () =>
    modals.openContextModal({
      modal: "attendance/extras/create",
      title: "Legg til nytt deltakervalg",
      innerProps: {
        attendance,
      },
    })
