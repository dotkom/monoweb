import { Box, Button, Card, Divider, Table, Text, Title } from "@mantine/core"
import { type FC } from "react"
import { z } from "zod"
import { useEventDetailsContext } from "./provider"
import { useCreatePoolModal } from "../../../../modules/event/modals/create-pool-modal"
import { useEventAttendanceGetQuery } from "../../../../modules/event/queries/use-event-attendance-get-query"
import { createDateTimeInput, createNumberInput, useFormBuilder } from "../../../form"

export const EventAttendanceInfoPage: FC = () => {
  const { event } = useEventDetailsContext()
  const { eventAttendance } = useEventAttendanceGetQuery(event.id)
  const openPoolModal = useCreatePoolModal({ eventId: event.id })

  const GeneralAttributesForm = useFormBuilder({
    schema: z.object({
      attendanceStart: z.date(),
      attendanceEnd: z.date(),
      poolMergeTime: z.date(),
      deregisterTime: z.date(),
      totalCapacity: z.number(),
    }),
    defaultValues: {
      attendanceStart: new Date(),
      attendanceEnd: new Date(),
      poolMergeTime: new Date(),
      deregisterTime: new Date(),
      totalCapacity: 0,
    },
    onSubmit: (values) => {
      console.log(values)
    },
    label: "Lagre",
    fields: {
      attendanceStart: createDateTimeInput({
        label: "Påmeldingsstart",
      }),
      attendanceEnd: createDateTimeInput({
        label: "Påmeldingsslutt",
      }),
      deregisterTime: createDateTimeInput({
        label: "Frist avmelding",
      }),
      poolMergeTime: createDateTimeInput({
        label: "Gruppemerging",
      }),
      totalCapacity: createNumberInput({
        label: "Totalt antall plasser",
      }),
    },
  })

  const getRange = ({ min, max }: { min: number; max: number }): number[] => [
    ...Array.from({ length: max - min }, (_, i) => min + i),
  ]

  const rangeToString = (ranges: number[][]): string => {
    // example: [1,2] [2,3]  => 1,2,3
    const flat = ranges.flat()
    return flat.join(", ")
  }

  const all = [0, 1, 2, 3, 4, 5]

  const notIncluded = (ranges: number[][]): number[] => {
    const flat = ranges.flat()
    return all.filter((num) => !flat.includes(num))
  }

  return (
    <Box>
      <Box>
        <Title mb={10} order={3}>
          Generelt
        </Title>
        <GeneralAttributesForm />
      </Box>
      <Divider my={32} />
      <Box>
        <Title mb={10} order={3}>
          Puljer
        </Title>
        <Button onClick={openPoolModal}>Opprett ny pulje</Button>
        <Box>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Td>Totalt plasser tildelt: </Table.Td>
                <Table.Td>{eventAttendance.reduce((acc, pool) => acc + pool.limit, 0)}</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Grupper med reserverte plasser</Table.Td>
                <Table.Td>{rangeToString(eventAttendance.filter((ev) => ev.limit !== 0).map(getRange))}</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Grupper som får plasser etter sammenslåing</Table.Td>
                <Table.Td>{rangeToString(eventAttendance.filter((ev) => ev.limit === 0).map(getRange))}</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Grupper som ikke vil få tilgang til arrangement</Table.Td>
                <Table.Td>{notIncluded(eventAttendance.map(getRange)).join(", ")}</Table.Td>
              </Table.Tr>
            </Table.Thead>
          </Table>
        </Box>
      </Box>
      <Box>
        {eventAttendance.map((attendance) => (
          <Card shadow="sm" padding="lg" radius="md" withBorder key={attendance.id} mt={16}>
            <Box>
              <Text>
                Klasse {attendance.min}- {attendance.max - 1}
              </Text>
              <Text>
                Reserverte plasser: {attendance.attendees.length} / {attendance.limit}
              </Text>
            </Box>
          </Card>
        ))}
        {eventAttendance.length === 0 && <Text fs="italic">Ingen puljer</Text>}
      </Box>
    </Box>
  )
}
