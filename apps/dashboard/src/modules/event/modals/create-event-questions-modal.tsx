import type { Attendance } from "@dotkomonline/types"
import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { QuestionsForm, type QuestionsFormValues } from "../../../components/molecules/QuestionsForm/QuestionsForm"
import { useUpdateAttendanceMutation } from "src/modules/attendance/mutations/use-attendance-mutations"

export const CreateAttendanceQuestionsModal: FC<ContextModalProps<{ attendance: Attendance }>> = ({
  context,
  id,
  innerProps,
}) => {
  const edit = useUpdateAttendanceMutation()
  const allQuestions = innerProps.attendance.questions || []

  const defaultAlternatives: QuestionsFormValues = {
    question: "",
    alternatives: [{ value: "" }],
  }

  const onSubmit = (data: QuestionsFormValues) => {
    const newQuestions = [
      ...allQuestions,
      {
        id: `${allQuestions.length}`,
        name: data.question,
        choices: data.alternatives.map((alternative, i) => ({
          id: `${i}`,
          name: alternative.value,
        })),
      },
    ]

    edit.mutate({
      id: innerProps.attendance.id,
      attendance: {
        questions: newQuestions,
      }
    })

    context.closeModal(id)
  }

  return <QuestionsForm onSubmit={onSubmit} defaultAlternatives={defaultAlternatives} />
}

export const useCreateAttendanceQuestionsModal  =
  ({ attendance }: { attendance: Attendance }) =>
  () =>
    modals.openContextModal({
      modal: "attendance/questions/create",
      title: "Legg til nytt deltakervalg",
      innerProps: {
        attendance,
      },
    })
