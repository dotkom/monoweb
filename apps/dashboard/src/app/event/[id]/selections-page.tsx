import { useTRPC } from "@/lib/trpc"
import type { Attendance, AttendanceSelectionResults } from "@dotkomonline/types"
import { Icon } from "@iconify/react"
import { ActionIcon, Box, Button, Divider, Paper, Table, Title } from "@mantine/core"
import { useQuery } from "@tanstack/react-query"
import type { FC } from "react"
import { useAttendanceForm } from "../components/attendance-form"
import { useCreateAttendanceSelectionsModal } from "../components/create-event-selections-modal"
import { useEditSelectionsModal } from "../components/edit-event-selections-modal"
import {
  useAddAttendanceMutation,
  useRemoveSelectionResponsesMutation,
  useUpdateAttendanceMutation,
} from "../mutations"
import { useEventDetailsContext } from "./provider"

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
    label: "Opprett",
    defaultValues: {
      registerStart: new Date(),
      registerEnd: new Date(),
      deregisterDeadline: new Date(),
      selections: [],
    },
    onSubmit: (values) => {
      mutation.mutate({ eventId, values })
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

  const updateAttendance = useUpdateAttendanceMutation()
  const removeSelectionResponses = useRemoveSelectionResponsesMutation()

  const { data: results, isLoading: resultsIsLoading } = useQuery({
    ...trpc.attendance.getSelectionsResults.queryOptions({
      attendanceId: attendance.id,
    }),
    initialData: [],
  })

  const onDelete = (selectionId: string) => {
    const newOptions = attendance.selections?.filter((selection) => selection.id !== selectionId)

    removeSelectionResponses.mutate({ selectionId })

    updateAttendance.mutate({
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
              <ActionIcon variant="outline" onClick={() => onDelete(selection.id)} color="red">
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
