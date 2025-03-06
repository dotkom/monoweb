import type { AttendancePool } from "@dotkomonline/types"
import { Box, Button, Card, Flex, Grid, Text, Title } from "@mantine/core"
import type { FC } from "react"
import { notifyFail } from "../../../../app/notifications"
import { openEditPoolModal } from "../../modals/edit-pool-modal"
import { useDeletePoolMutation } from "../../mutations/use-pool-mutations"

interface PoolsBoxProps {
  pools: AttendancePool[]
  attendanceId: string
}

interface NormalPoolBoxProps {
  pool: AttendancePool
  attendanceId: string
  deleteGroup: (id: string, numAttendees: number) => void
}

const AttendancePoolCard: FC<NormalPoolBoxProps> = ({ pool, attendanceId, deleteGroup }) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder key={pool.id} mt={16}>
      <Flex justify="space-between" direction="column" gap="lg">
        <Box>
          <Title order={2}>{pool.title}</Title>
          <Text>
            {pool.capacity > 0
              ? `${Math.min(pool.numAttendees, pool.capacity)} / ${pool.capacity} påmeldte`
              : "Ledige plasser"}
          </Text>
          {pool.numAttendees - pool.capacity > 0 && <Text>{pool.numAttendees - pool.capacity} på venteliste</Text>}
        </Box>
        <Box>
          <Button
            onClick={openEditPoolModal({
              attendanceId,
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
          <Button onClick={() => deleteGroup(pool.id, pool.numAttendees)} color="red">
            Slett
          </Button>
        </Box>
      </Flex>
    </Card>
  )
}

export const PoolBox: FC<PoolsBoxProps> = ({ pools, attendanceId }) => {
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
      {pools?.map((pool) => (
        <AttendancePoolCard key={pool.id} pool={pool} deleteGroup={deleteGroup} attendanceId={attendanceId} />
      ))}
      {pools?.length === 0 && <Text fs="italic">Ingen påmeldingsgrupper</Text>}
    </Grid>
  )
}
