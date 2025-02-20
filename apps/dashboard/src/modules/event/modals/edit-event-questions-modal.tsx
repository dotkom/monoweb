import type { Attendance, AttendanceQuestion } from "@dotkomonline/types"
import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { useUpdateAttendanceMutation } from "src/modules/attendance/mutations/use-attendance-mutations"
import { QuestionsForm, type QuestionsFormValues } from "../../../components/molecules/QuestionsForm/QuestionsForm"

export const UpdateAttendanceQuestionsModal: FC<
  ContextModalProps<{ existingQuestion: AttendanceQuestion; attendance: Attendance }>
> = ({ context, id, innerProps: { attendance, existingQuestion } }) => {
  const edit = useUpdateAttendanceMutation()

  const allQuestions = attendance.questions || []

  const defaultAlternatives = {
    question: existingQuestion.name,
    alternatives: existingQuestion.choices.map((choice) => ({
      value: choice.name,
    })),
  }

  const onSubmit = (data: QuestionsFormValues) => {
    const newQuestions = allQuestions.map((question) => {
      if (question.id === existingQuestion.id) {
        return {
          id: question.id,
          name: data.question,
          choices: data.alternatives.map((alternative, i) => ({
            id: `${i}`,
            name: alternative.value,
          })),
        }
      }
      return question
    })

    edit.mutate({
      id: attendance.id,
      attendance: { questions: newQuestions },
    })

    context.closeModal(id)
  }

  return <QuestionsForm onSubmit={onSubmit} defaultAlternatives={defaultAlternatives} />
}

export const useEditQuestionsModal =
  ({ attendance }: { attendance: Attendance }) =>
  (existingQuestion: AttendanceQuestion) =>
    modals.openContextModal({
      modal: "attendance/questions/update",
      title: "Endre question",
      innerProps: {
        attendance,
        existingQuestion,
      },
    })
