import type { Attendance, AttendanceSelectionResults } from "@dotkomonline/types"
import { Icon } from "@iconify/react"
import { ActionIcon, Box, Button, Divider, Paper, Table, Title } from "@mantine/core"
import type { FC } from "react"
import useAttendanceForm from "../../../../modules/attendance/components/attendance-page/AttendanceForm"
import {
  useAddAttendanceMutation,
  useUpdateAttendanceMutation,
} from "../../../../modules/attendance/mutations/use-attendance-mutations"
import { useCreateAttendanceSelectionsModal } from "../../../../modules/event/modals/create-event-selections-modal"
import { useEditSelectionsModal } from "../../../../modules/event/modals/edit-event-selections-modal"
import { useEventDetailsContext } from "./provider"
import {useTRPC} from "../../../../trpc";
import {useQuery} from "@tanstack/react-query";


export const SelectionsPage: FC = () => {
  const { attendance } = useEventDetailsContext()
  const { event } = useEventDetailsContext()

  if (!attendance) {
    return <NoAttendanceFallback eventId={event.id} />
  }

  return <SelectionsPageDetail attendance={attendance} />
}

const NoAttendanceFallback: FC<{ eventId: string }> = ({ eventId }) => {
  const mutation = useAddAttendanceMutation()
  const AttendanceForm = useAttendanceForm({
    defaultValues: {
      registerStart: new Date(),
      registerEnd: new Date(),
      deregisterDeadline: new Date(),
      selections: [],
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
export const SelectionsPageDetail: FC<Props> = ({ attendance }) => {
  const trpc = useTRPC()
  const openCreate = useCreateAttendanceSelectionsModal({
    attendance,
  })

  const openEdit = useEditSelectionsModal({
    attendance,
  })

  const edit = useUpdateAttendanceMutation()
  const { data: results = [], isLoading: resultsIsLoading } = useQuery(
    trpc.attendance.getSelectionsResults.queryOptions({
      attendanceId: attendance.id,
    })
  )

  const deleteAlternative = (id: string) => {
    const newOptions = attendance.selections?.filter((alt) => alt.id !== id)
    edit.mutate({
      id: attendance.id,
      attendance: {
        selections: newOptions ?? [],
      },
    })
  }

  const selectionsResults = resultsIsLoading ? (
    <p>Laster...</p>
  ) : results === null ? (
    <div>Ingen valg</div>
  ) : (
    <AttendanceSelectionsTable results={results} />
  )

  return (
    <Box>
      <Box>
        <Title order={3}>Valg</Title>
        {!attendance.selections?.length && <p>Ingen valg er lagt til</p>}
        <Box>
          {attendance.selections?.map((selection) => (
            <Paper key={selection.id} withBorder p={"md"} mt={"md"}>
              <ActionIcon variant="outline" onClick={() => openEdit(selection)} mr="md">
                <Icon icon="tabler:edit" />
              </ActionIcon>
              <ActionIcon variant="outline" onClick={() => deleteAlternative(selection.id)} color="red">
                <Icon icon="tabler:trash" />
              </ActionIcon>
              <h3>{selection.name}</h3>
              {selection.options.map((option) => (
                <div key={option.id}>
                  <p>{option.name}</p>
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
        {selectionsResults}
      </Box>
    </Box>
  )
}

interface AttendanceSelectionsTableProps {
  results: AttendanceSelectionResults[]
}

function AttendanceSelectionsTable({ results }: AttendanceSelectionsTableProps) {
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
              {result.options.map((option) => (
                <Table.Tr key={option.id}>
                  <Table.Td>{option.name}</Table.Td>
                  <Table.Td>{option.count}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      ))}
    </div>
  )
}
