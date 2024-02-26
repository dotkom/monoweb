import { type AttendancePoolWithNumAttendees } from "@dotkomonline/types"
import { Box, Button, Card, Divider, Flex, Table, Text, Title } from "@mantine/core"
import { type FC } from "react"
import { z } from "zod"
import { useEventDetailsContext } from "./provider"
import { openCreatePoolModal, openEditPoolModal } from "../../../../modules/event/modals/create-pool-modal"
import { useEventAttendanceGetQuery } from "../../../../modules/event/queries/use-event-attendance-get-query"
import { trpc } from "../../../../utils/trpc"
import { createDateTimeInput, useFormBuilder } from "../../../form"
import { notifyComplete, notifyFail } from "../../../notifications"

const rangeToString = (ranges: number[][]): string => {
  // example: [1,2] [2,3]  => 1,2,3
  const flat = ranges.flat()
  return flat.sort().join(", ")
}

const InfoBox: FC<{ pools: AttendancePoolWithNumAttendees }> = ({ pools }) => {
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
  const { pools } = useEventAttendanceGetQuery(attendance?.id || "") // TODO wtf fix this
  const deleteGroupMut = trpc.event.attendance.deletePool.useMutation()
  const updateAttendanceMut = trpc.event.attendance.updateAttendance.useMutation({
    onError: (error) => {
      notifyFail({
        title: "Feil",
        message: error.message,
      })
    },

    onMutate: () => {
      notifyComplete({
        title: "Laster",
        message: "Laster...",
      })
    },
    onSuccess: () => {
      notifyComplete({
        title: "Suksess",
        message: "Oppdatert",
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

  const updateGroup = (id: string, limit: number, yearCriteria: number[]) => {
    openEditPoolModal({
      attendanceId: attendance?.id || "",
      defaultValues: {
        limit,
        yearCriteria,
      },
    })

    deleteGroupMut.mutate({
      id,
    })
  }

  const GeneralAttributesForm = useFormBuilder({
    schema: z.object({
      registerStart: z.date(),
      registerEnd: z.date(),
      poolMergeTime: z.date(),
      deregisterDeadline: z.date(),
    }),
    defaultValues: {
      registerStart: attendance?.registerStart || new Date(),
      registerEnd: attendance?.registerEnd || new Date(),
      poolMergeTime: attendance?.mergeTime || new Date(),
      deregisterDeadline: attendance?.deregisterDeadline || new Date(),
    },
    onSubmit: (values) => {
      updateAttendanceMut.mutate({
        id: attendance?.id || "",
        attendance: {
          registerStart: values.registerStart,
          registerEnd: values.registerEnd,
          mergeTime: values.poolMergeTime,
          deregisterDeadline: values.deregisterDeadline,
        },
      })
    },
    label: "Lagre",
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
      poolMergeTime: createDateTimeInput({
        label: "Gruppemerging",
      }),
    },
  })

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
          Reserverte plasser
        </Title>
        <InfoBox pools={pools || []} />
        <Button
          mt={16}
          onClick={openCreatePoolModal({
            attendanceId: attendance?.id || "",
          })}
        >
          Opprett ny pulje2
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
                  onClick={() => updateGroup(attendance.id, attendance.limit, attendance.yearCriteria)}
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
