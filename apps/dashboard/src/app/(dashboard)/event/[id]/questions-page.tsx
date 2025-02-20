import type { Attendance, AttendanceQuestionResults } from "@dotkomonline/types"
import { Icon } from "@iconify/react"
import { ActionIcon, Box, Button, Divider, Paper, Table, Title } from "@mantine/core"
import type { FC } from "react"
import useAttendanceForm from "../../../../modules/attendance/components/attendance-page/AttendanceForm"
import {
  useAddAttendanceMutation,
  useUpdateAttendanceMutation
} from "../../../../modules/attendance/mutations/use-attendance-mutations"
import { useCreateAttendanceQuestionsModal } from "../../../../modules/event/modals/create-event-questions-modal"
import { useEditQuestionsModal } from "../../../../modules/event/modals/edit-event-questions-modal"
import { trpc } from "../../../../trpc"
import { useEventDetailsContext } from "./provider"

export const QuestionsPage: FC = () => {
  const { attendance } = useEventDetailsContext()
  const { event } = useEventDetailsContext()

  if (!attendance) {
    return <NoAttendanceFallback eventId={event.id} />
  }

  return <QuestionsPageDetail attendance={attendance} />
}

const NoAttendanceFallback: FC<{ eventId: string }> = ({ eventId }) => {
  const mutation = useAddAttendanceMutation()
  const AttendanceForm = useAttendanceForm({
    defaultValues: {
      registerStart: new Date(),
      registerEnd: new Date(),
      deregisterDeadline: new Date(),
      questions: [],
    },
    label: "Opprett",
    onSubmit: (values) => {
      mutation.mutate({ eventId, obj: values })
    },
  })

  return (
    <Box>
      <Title order={5}>Ingen påmelding</Title>
      <AttendanceForm />
    </Box>
  )
}
interface Props {
  attendance: Attendance
}
export const QuestionsPageDetail: FC<Props> = ({ attendance }) => {
  const openCreate = useCreateAttendanceQuestionsModal({
    attendance,
  })

  const openEdit = useEditQuestionsModal({
    attendance,
  })

  const edit = useUpdateAttendanceMutation()

  const { data: results = [], isLoading: resultsIsLoading } = trpc.attendance.getQuestionsResults.useQuery({
    attendanceId: attendance.id,
  })

  const deleteAlternative = (id: string) => {
    const newChoices = attendance.questions?.filter((alt) => alt.id !== id)
    edit.mutate({
      id: attendance.id,
      attendance: {
        questions: newChoices ?? [],
      }
    })
  }

  const questionsResults = resultsIsLoading ? (
    <p>Laster...</p>
  ) : results === null ? (
    <div>Ingen valg</div>
  ) : (
    <AttendanceQuestionsTable results={results} />
  )

  return (
    <Box>
      <Box>
        <Title order={3}>Valg</Title>
        {!attendance.questions?.length && <p>Ingen valg er lagt til</p>}
        <Box>
          {attendance.questions?.map((question) => (
            <Paper key={question.id} withBorder p={"md"} mt={"md"}>
              <ActionIcon variant="outline" onClick={() => openEdit(question)} mr="md">
                <Icon icon="tabler:edit" />
              </ActionIcon>
              <ActionIcon variant="outline" onClick={() => deleteAlternative(question.id)} color="red">
                <Icon icon="tabler:trash" />
              </ActionIcon>
              <h3>{question.name}</h3>
              {question.choices.map((choice) => (
                <div key={choice.id}>
                  <p>{choice.name}</p>
                </div>
              ))}
            </Paper>
          ))}
        </Box>

        <Button mt="md" onClick={openCreate}>
          Legg til nytt valg
        </Button>
      </Box>
      <Divider mt="xl" mb="xl" />
      <Box>
        <Title order={3}> Resultater</Title>
        {questionsResults}
      </Box>
    </Box>
  )
}

interface AttendanceQuestionsTableProps {
  results: AttendanceQuestionResults[]
}

function AttendanceQuestionsTable({ results }: AttendanceQuestionsTableProps) {
  return (
    <div>
      {results.map((result, index) => (
        <div key={result.id}>
          <h2>
            {result.name} - ({result.totalCount}) svar
          </h2>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Valg</Table.Th>
                <Table.Th w={100}>Antall</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {result.choices.map((choice) => (
                <Table.Tr key={choice.id}>
                  <Table.Td>{choice.name}</Table.Td>
                  <Table.Td>{choice.count}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      ))}
    </div>
  )
}
