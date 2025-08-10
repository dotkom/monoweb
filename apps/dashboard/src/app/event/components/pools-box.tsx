import { notifyFail } from "@/lib/notifications"
import type {Attendance, AttendancePool} from "@dotkomonline/types"
import { Box, Button, Card, Flex, Grid, Text, Title } from "@mantine/core"
import type { FC } from "react"
import { useDeletePoolMutation } from "../mutations"
import { openEditPoolModal } from "./edit-pool-modal"

interface NormalPoolBoxProps {
  pool: AttendancePool
  attendance: Attendance
  deleteGroup: (id: string, numAttendees: number) => void
}

const AttendancePoolCard: FC<NormalPoolBoxProps> = ({ pool, attendance, deleteGroup }) => {
  const attendeeCount = attendance.attendees.filter((attendee) => attendee.attendancePoolId === pool.id).length
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder key={pool.id} mt={16}>
      <Flex justify="space-between" direction="column" gap="lg">
        <Box>
          <Title order={2}>{pool.title}</Title>
          <Text>
            {pool.capacity > 0
              ? `${Math.min(attendeeCount, pool.capacity)} / ${pool.capacity} påmeldte`
              : "Ledige plasser"}
          </Text>
          {attendeeCount - pool.capacity > 0 && <Text>{attendeeCount - pool.capacity} på venteliste</Text>}
        </Box>
        <Box>
          <Button
            onClick={openEditPoolModal({
              attendanceId: attendance.id,
              defaultValues: {
                capacity: pool.capacity,
                title: pool.title,
                yearCriteria: pool.yearCriteria,
              },
              poolId: pool.id,
            })}
            color="yellow"
            mr={16}
          >
            Endre
          </Button>
          <Button onClick={() => deleteGroup(pool.id, attendeeCount)} color="red">
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
    <Grid columns={4} gutter="md">
      {attendance.pools?.map((pool) => (
        <AttendancePoolCard key={pool.id} pool={pool} deleteGroup={deleteGroup} attendance={attendance} />
      ))}
      {attendance.pools?.length === 0 && <Text fs="italic">Ingen påmeldingsgrupper</Text>}
    </Grid>
  )
}
