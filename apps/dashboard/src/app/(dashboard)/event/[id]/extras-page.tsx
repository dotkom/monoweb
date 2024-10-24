import type { Attendance, ExtraResults } from "@dotkomonline/types"
import { Icon } from "@iconify/react"
import { ActionIcon, Box, Button, Divider, Paper, Table, Title } from "@mantine/core"
import type { FC } from "react"
import useAttendanceForm from "../../../../modules/attendance/components/attendance-page/AttendanceForm"
import {
  useAddAttendanceMutation,
  useUpdateExtrasMutation,
} from "../../../../modules/attendance/mutations/use-attendance-mutations"
import { useCreateAttendanceExtrasModal } from "../../../../modules/event/modals/create-event-extras-modal"
import { useEditExtrasModal } from "../../../../modules/event/modals/edit-event-extras-modal"
import { trpc } from "../../../../utils/trpc"
import { useEventDetailsContext } from "./provider"

export const ExtrasPage: FC = () => {
  const { attendance } = useEventDetailsContext()
  const { event } = useEventDetailsContext()

  if (!attendance) {
    return <NoAttendanceFallback eventId={event.id} />
  }

  return <ExtrasPageDetail attendance={attendance} />
}

const NoAttendanceFallback: FC<{ eventId: string }> = ({ eventId }) => {
  const mutation = useAddAttendanceMutation()
  const AttendanceForm = useAttendanceForm({
    defaultValues: {
      registerStart: new Date(),
      registerEnd: new Date(),
      deregisterDeadline: new Date(),
      extras: [],
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
export const ExtrasPageDetail: FC<Props> = ({ attendance }) => {
  const openCreate = useCreateAttendanceExtrasModal({
    attendance,
  })

  const openEdit = useEditExtrasModal({
    attendance,
  })

  const edit = useUpdateExtrasMutation()

  const { data: results = [], isLoading: resultsIsLoading } = trpc.attendance.getExtrasResults.useQuery({
    attendanceId: attendance.id,
  })

  const deleteAlternative = (id: string) => {
    const newChoices = attendance.extras?.filter((alt) => alt.id !== id)
    edit.mutate({
      id: attendance.id,
      extras: newChoices ?? [],
    })
  }

  const extrasResults = resultsIsLoading ? (
    <p>Laster...</p>
  ) : results === null ? (
    <div>Ingen valg</div>
  ) : (
    <AttendanceExtrasTable results={results} />
  )

  return (
    <Box>
      <Box>
        <Title order={3}>Valg</Title>
        {!attendance.extras?.length && <p>Ingen valg er lagt til</p>}
        <Box>
          {attendance.extras?.map((extra) => (
            <Paper key={extra.id} withBorder p={"md"} mt={"md"}>
              <ActionIcon variant="outline" onClick={() => openEdit(extra)} mr="md">
                <Icon icon="tabler:edit" />
              </ActionIcon>
              <ActionIcon variant="outline" onClick={() => deleteAlternative(extra.id)} color="red">
                <Icon icon="tabler:trash" />
              </ActionIcon>
              <h3>{extra.name}</h3>
              {extra.choices.map((choice) => (
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
        {extrasResults}
      </Box>
    </Box>
  )
}

interface AttendanceExtrasTableProps {
  results: ExtraResults[]
}

function AttendanceExtrasTable({ results }: AttendanceExtrasTableProps) {
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
