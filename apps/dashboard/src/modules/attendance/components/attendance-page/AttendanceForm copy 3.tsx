import { AttendanceSchema, type Attendance, type AttendancePool } from "@dotkomonline/types"
import { Box, Button, Card, Divider, Flex, Table, Text, Title } from "@mantine/core"
import { type FC } from "react"
import { type z } from "zod"
import { useEventDetailsContext } from "./provider"
import { openCreatePoolModal } from "../../../../modules/attendance/modals/create-pool-modal"
import { useEventAttendanceGetQuery } from "../../../../modules/attendance/queries/use-event-attendance-get-query"
import { trpc } from "../../../../utils/trpc"
import { createDateTimeInput, useFormBuilder } from "../../../form"
import { notifyComplete, notifyFail } from "../../../notifications"
import { openEditPoolModal } from "../../../../modules/attendance/modals/edit-pool-modal"
import { baseDeleteMutationOpts, baseUpdateMutationOpts } from "../../../../utils/helpers"

interface AttendanceForm {
  onSubmit(values: z.infer<typeof AttendanceFormSchema>): void
  defaultValues?: z.infer<typeof AttendanceFormSchema>
  label: string
}

const AttendanceFormSchema = AttendanceSchema.omit({
  eventId: true,
  id: true,
})

const useAttendanceForm = ({ onSubmit, defaultValues, label }: AttendanceForm) =>
  useFormBuilder({
    schema: AttendanceFormSchema,
    defaultValues,
    onSubmit,
    label,
    fields: {
      registerStart: createDateTimeInput({
        label: "Påmeldingsstart",
      }),
      registerEnd: createDateTimeInput({
        label: "Påmeldingsslutt",
      }),
      deregisterDeadline: createDateTimeInput({
        label: "Frist avmelding",
      }),
      mergeTime: createDateTimeInput({
        label: "Gruppemerging",
      }),
    },
  })

const rangeToString = (ranges: number[][]): string => {
  // example: [1,2] [2,3]  => 1,2,3
  const flat = ranges.flat()
  return flat.sort().join(", ")
}

const InfoBox: FC<{ pools: AttendancePool[] }> = ({ pools }) => {
  const all = [0, 1, 2, 3, 4, 5]

  const notIncluded = (ranges: number[][]): number[] => {
    const flat = ranges.flat()
    return all.filter((num) => !flat.includes(num))
  }
  return (
    <Box>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Td>Totalt antall plasser</Table.Td>
            <Table.Td>{pools.reduce((acc, pool) => acc + pool.limit, 0)}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Grupper med reserverte plasser</Table.Td>
            <Table.Td>
              {rangeToString(pools.filter(({ limit }) => limit !== 0).map(({ yearCriteria }) => yearCriteria))}
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Grupper som kan melde seg på etter sammenslåing</Table.Td>
            <Table.Td>
              {rangeToString(pools.filter((ev) => ev.limit === 0).map(({ yearCriteria }) => yearCriteria))}
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Grupper som ikke vil få tilgang til arrangement</Table.Td>
            <Table.Td>{notIncluded(pools.map(({ yearCriteria }) => yearCriteria)).join(", ")}</Table.Td>
          </Table.Tr>
        </Table.Thead>
      </Table>
    </Box>
  )
}

export const EventAttendanceInfoPage: FC = () => {
  const { attendance } = useEventDetailsContext()
  const { event } = useEventDetailsContext()

  if (!attendance) {
    return <NoAttendancePage eventId={event.id} />
  }

  return <EventAttendance attendance={attendance} />
}

interface NoAttendancePageProps {
  eventId: string
}
export const NoAttendancePage: FC<NoAttendancePageProps> = ({ eventId }) => {
  const mutation = trpc.event.attendance.createAttendance.useMutation(baseDeleteMutationOpts)

  const Form = useAttendanceForm({
    onSubmit: (values) => {
      mutation.mutate({
        eventId,
        obj: {
          registerStart: values.registerStart,
          registerEnd: values.registerEnd,
          mergeTime: values.mergeTime,
          deregisterDeadline: values.deregisterDeadline,
        },
      })
    },
    label: "Opprett påmelding",
  })

  return (
    <Box>
      <Title order={5}>Ingen påmelding</Title>
      <Form />
    </Box>
  )
}

interface EventAttendanceProps {
  attendance: Attendance
}
export const EventAttendance: FC<EventAttendanceProps> = ({ attendance }) => {
  const { pools } = useEventAttendanceGetQuery(attendance.id)

  const updateAttendance = trpc.event.attendance.updateAttendance.useMutation(baseUpdateMutationOpts)
  const deleteGroupMut = trpc.event.attendance.deletePool.useMutation(baseDeleteMutationOpts)

  const AttendanceForm = useAttendanceForm({
    defaultValues: attendance,
    label: "Lagre",
    onSubmit: (values) => {
      updateAttendance.mutate({
        id: attendance.id,
        attendance: {
          registerStart: values.registerStart,
          registerEnd: values.registerEnd,
          mergeTime: values.mergeTime,
          deregisterDeadline: values.deregisterDeadline,
        },
      })
    },
  })

  const deleteGroup = (id: string, numAttendees: number) => {
    if (numAttendees > 0) {
      notifyFail({
        title: "Feil",
        message: "Gruppen har deltakere, og kan ikke slettes",
      })
      return
    }

    deleteGroupMut.mutate({
      id,
    })
  }

  return (
    <Box>
      <Box>
        <Title mb={10} order={3}>
          Generelt
        </Title>
        <AttendanceForm />
      </Box>
      <Divider my={32} />
      <Box>
        <Title mb={10} order={3}>
          Reserverte plasser
        </Title>
        <InfoBox pools={pools || []} />
        <Button
          mt={16}
          onClick={openCreatePoolModal({
            attendanceId: attendance.id,
          })}
        >
          Opprett ny pulje
        </Button>
      </Box>
      <Box>
        {pools?.map((attendance) => (
          <Card shadow="sm" padding="lg" radius="md" withBorder key={attendance.id} mt={16}>
            <Flex justify="space-between">
              <Box>
                <Text>{rangeToString([attendance.yearCriteria])}</Text>
                <Text>
                  Reserverte plasser: {attendance.numAttendees} / {attendance.limit}
                </Text>
              </Box>
              <Box>
                <Button
                  onClick={openEditPoolModal({
                    attendanceId: attendance.id,
                    defaultValues: {
                      limit: attendance.limit,
                      yearCriteria: attendance.yearCriteria,
                    },
                    poolId: attendance.id,
                  })}
                  color="yellow"
                  mr={16}
                >
                  Endre
                </Button>
                <Button onClick={() => deleteGroup(attendance.id, attendance.numAttendees)} color="red">
                  Slett
                </Button>
              </Box>
            </Flex>
          </Card>
        ))}
        {pools?.length === 0 && <Text fs="italic">Ingen puljer</Text>}
      </Box>
    </Box>
  )
}
