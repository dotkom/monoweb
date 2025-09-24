import { createDateTimeInput } from "@/components/forms/DateTimeInput"
import { useTRPC } from "@/lib/trpc-client"
import { type Attendance,type AttendanceWrite,AttendanceWriteSchema } from "@dotkomonline/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { ActionIcon, Box, Button, Divider, Group, Paper, Table, Title } from "@mantine/core"
import { IconEdit, IconTrash } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import type { FC } from "react"
import { useForm } from "react-hook-form"
import { useCreateAttendanceSelectionsModal } from "../components/create-event-selections-modal"
import { useEditSelectionsModal } from "../components/edit-event-selections-modal"
import { useAddAttendanceMutation, useUpdateAttendanceMutation } from "../mutations"
import { useEventContext } from "./provider"

export const SelectionsPage: FC = () => {
  const { event, attendance } = useEventContext()
  if (!attendance) {
    return <NoAttendanceFallback eventId={event.id} />
  }

  return <SelectionsPageDetail attendance={attendance} />
}

const NoAttendanceFallback: FC<{ eventId: string }> = ({ eventId }) => {
  const mutation = useAddAttendanceMutation()

  const form = useForm<AttendanceWrite>({
    resolver: zodResolver(AttendanceWriteSchema),
    mode: "onBlur",
    defaultValues: {
      registerStart: new Date(),
      registerEnd: new Date(),
      deregisterDeadline: new Date(),
    },
  })

  const Lol = createDateTimeInput<AttendanceWrite>({ label: "Påmeldingsstart" })
  const x = <Lol
        defaultValue={form.formState.defaultValues?.["registerStart"] ?? new Date()}
        key={"registerStart"}
        name={"registerStart"}
        register={form.register}
        control={form.control}
        state={form.formState}
      />

  return (
    <Box>
      <Title order={5}>Ingen påmelding</Title>
      
      <form
        onSubmit={(e) => {
          e.preventDefault()
          return form.handleSubmit((values) => {
            return onSubmit(values, form)
          })(e)
        }}
      >
        <Group gap="md">
          {x}
          
          <div>
            <Button type="submit" disabled={disabled}>
              {label}
            </Button>
          </div>
        </Group>
      </form>
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
              <ActionIcon variant="outline" onClick={() => openEdit(selection)} mr="md">
                <IconEdit />
              </ActionIcon>
              <ActionIcon variant="outline" onClick={() => onDelete(selection.id)} color="red">
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
