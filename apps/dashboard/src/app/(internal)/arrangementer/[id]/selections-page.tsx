import { useTRPC } from "@/lib/trpc-client"
import type { Attendance } from "@dotkomonline/rpc/attendance"
import { ActionIcon, Box, Button, Divider, Paper, Table, Text, Title } from "@mantine/core"
import { IconEdit, IconTrash } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import type { FC } from "react"
import { useEventEditPermission } from "@/hooks/use-event-edit-permission"
import { useCreateAttendanceSelectionsModal } from "../components/create-event-selections-modal"
import { useEditSelectionsModal } from "../components/edit-event-selections-modal"
import { useUpdateAttendanceMutation } from "../mutations"
import { useEventContext } from "./provider"

export const SelectionsPage: FC = () => {
  const { attendance } = useEventContext()
  if (!attendance) {
    return (
      <Box>
        <Title order={5}>Ingen påmelding</Title>
        <Text mt="sm">Opprett en påmelding før du kan legge til valg.</Text>
      </Box>
    )
  }

  return <SelectionsPageDetail attendance={attendance} />
}

interface Props {
  attendance: Attendance
}
export const SelectionsPageDetail: FC<Props> = ({ attendance }) => {
  const { canEdit } = useEventEditPermission()
  const trpc = useTRPC()
  const openCreate = useCreateAttendanceSelectionsModal({
    attendance,
  })

  const openEdit = useEditSelectionsModal({
    attendance,
  })

  const updateAttendance = useUpdateAttendanceMutation()

  const { data: results, isLoading: resultsIsLoading } = useQuery({
    ...trpc.event.attendance.getSelectionsResults.queryOptions({
      attendanceId: attendance.id,
    }),
    initialData: [],
  })

  const onDelete = (selectionId: string) => {
    const newOptions = attendance.selections?.filter((selection) => selection.id !== selectionId)
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
    <div>
      {results.map((result) => (
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

  return (
    <Box>
      <Box>
        <Title order={3}>Valg</Title>
        {!attendance.selections?.length && <p>Ingen valg er lagt til</p>}
        <Box>
          {attendance.selections?.map((selection) => (
            <Paper key={selection.id} withBorder p={"md"} mt={"md"}>
              <ActionIcon variant="outline" onClick={() => openEdit(selection)} mr="md" disabled={!canEdit}>
                <IconEdit />
              </ActionIcon>
              <ActionIcon variant="outline" onClick={() => onDelete(selection.id)} color="red" disabled={!canEdit}>
                <IconTrash />
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

        <Button mt="md" onClick={openCreate} disabled={!canEdit}>
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
