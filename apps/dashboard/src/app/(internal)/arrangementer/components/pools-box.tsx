import { notifyFail } from "@/lib/notifications"
import {
  type Attendance,
  type AttendancePool,
  getReservedAttendeeCount,
  getUnreservedAttendeeCount,
} from "@dotkomonline/types"
import { Box, Button, Card, Flex, Group, Space, Text, Title } from "@mantine/core"
import type { FC } from "react"
import { useDeletePoolMutation } from "../mutations"
import { openEditPoolModal } from "./edit-pool-modal"
import { formatPoolYearCriterias } from "./utils"

interface NormalPoolBoxProps {
  pool: AttendancePool
  attendance: Attendance
  deleteGroup: (id: string, numAttendees: number) => void
}

const AttendancePoolCard: FC<NormalPoolBoxProps> = ({ pool, attendance, deleteGroup }) => {
  const reservedAttendeeCount = getReservedAttendeeCount(attendance, pool.id)
  const unreservedAttendeeCount = getUnreservedAttendeeCount(attendance, pool.id)

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder key={pool.id} mt={16}>
      <Flex justify="space-between" direction="column" gap="lg">
        <Box>
          <Title order={4} fw={600}>
            {pool.title}
          </Title>
          <Text>
            {reservedAttendeeCount} {pool.capacity > 0 ? `/ ${pool.capacity} påmeldte` : "påmeldte (ledige plasser)"}
          </Text>
          {unreservedAttendeeCount > 0 && <Text>{unreservedAttendeeCount} på venteliste</Text>}
          <Space h="xs" />
          <Text size="sm">Årstrinn: {formatPoolYearCriterias(pool.yearCriteria)}</Text>
          <Text size="sm">
            Utsettelse:{" "}
            {pool.mergeDelayHours && pool.mergeDelayHours > 0 ? `${pool.mergeDelayHours} timer` : "Ingen utsettelse"}
          </Text>
        </Box>
        <Box>
          <Button
            onClick={openEditPoolModal({
              attendanceId: attendance.id,
              defaultValues: {
                capacity: pool.capacity,
                title: pool.title,
                yearCriteria: pool.yearCriteria,
                mergeDelayHours: pool.mergeDelayHours,
              },
              poolId: pool.id,
            })}
            color="yellow"
            mr={16}
          >
            Rediger
          </Button>
          <Button onClick={() => deleteGroup(pool.id, reservedAttendeeCount)} color="red">
            Slett
          </Button>
        </Box>
      </Flex>
    </Card>
  )
}

interface PoolsBoxProps {
  attendance: Attendance
}

export const PoolBox: FC<PoolsBoxProps> = ({ attendance }) => {
  const deleteGroupMut = useDeletePoolMutation()
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
    <Group gap="md">
      {attendance.pools?.map((pool) => (
        <AttendancePoolCard key={pool.id} pool={pool} deleteGroup={deleteGroup} attendance={attendance} />
      ))}
      {attendance.pools?.length === 0 && <Text fs="italic">Ingen påmeldingsgrupper</Text>}
    </Group>
  )
}
