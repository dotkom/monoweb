import { Attendance, Extras } from "@dotkomonline/types"
import { type ContextModalProps, modals } from "@mantine/modals"
import { type FC } from "react"
import { ExtrasForm, type ExtrasFormValues } from "../../../components/molecules/extras-form/ExtrasForm"
import { useUpdateExtrasMutation } from "../../attendance/mutations/use-attendance-mutations"

export const UpdateAttendanceExtrasModal: FC<ContextModalProps<{ existingExtra: Extras; attendance: Attendance }>> = ({
  context,
  id,
  innerProps,
}) => {
  const edit = useUpdateExtrasMutation()

  const allExtras = innerProps.attendance.extras || []
  const existingExtra = innerProps.existingExtra

  const defaultAlternatives = {
    question: existingExtra.name,
    alternatives: existingExtra.choices.map((choice) => ({
      value: choice.name,
    })),
  }

  const onSubmit = (data: ExtrasFormValues) => {
    const newExtras = allExtras.map((extra) => {
      if (extra.id === existingExtra.id) {
        return {
          id: extra.id,
          name: data.question,
          choices: data.alternatives.map((alternative, i) => ({
            id: `${i}`,
            name: alternative.value,
          })),
        }
      }
      return extra
    })

    edit.mutate({
      id: innerProps.attendance.id,
      extras: newExtras,
    })

    context.closeModal(id)
  }

  return <ExtrasForm onSubmit={onSubmit} defaultAlternatives={defaultAlternatives} />
}

export const useEditExtrasModal =
  ({ attendance }: { attendance: Attendance }) =>
  (existingExtra: Extras) =>
    modals.openContextModal({
      modal: "attendance/extras/update",
      title: "Endre extra",
      innerProps: {
        attendance,
        existingExtra,
      },
    })
