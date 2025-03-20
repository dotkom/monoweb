import type {
  AttendancePoolDetails,
  AttendancePoolDetails as AttendancePoolWithAttendeeNums,
} from "@dotkomonline/types"
import { Box, Button, Card, Flex, Grid, Text, Title } from "@mantine/core"
import type { FC } from "react"
import { notifyFail } from "../../../../app/notifications"
import { openEditPoolModal } from "../../modals/edit-pool-modal"
import { useDeletePoolMutation } from "../../mutations/use-pool-mutations"

interface PoolsBoxProps {
  pools: AttendancePoolWithAttendeeNums[]
}

interface NormalPoolBoxProps {
  pool: AttendancePoolWithAttendeeNums
  deletePool: () => void
}

const AttendancePoolCard: FC<NormalPoolBoxProps> = ({ pool, deletePool }) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder key={pool.id} mt={16}>
      <Flex justify="space-between" direction="column" gap="lg">
        <Box>
          <Title order={2}>{pool.title}</Title>
          <Text>
            {pool.capacity > 0
              ? `${Math.min(pool.capacityUsed, pool.capacity)} / ${pool.capacity} påmeldte`
              : "Ledige plasser"}
          </Text>
          {pool.capacityUsed - pool.capacity > 0 && <Text>{pool.capacityUsed - pool.capacity} på venteliste</Text>}
        </Box>
        <Box>
          <Button
            onClick={openEditPoolModal({
              attendanceId: pool.attendanceId,
              defaultValues: {
                capacity: pool.capacity,
                title: pool.title,
                yearCriteria: pool.yearCriteria,
                mergeDelayHours: pool.mergeDelayHours ?? 0,
              },
              poolId: pool.id,
            })}
            color="yellow"
            mr={16}
          >
            Endre
          </Button>
          <Button onClick={() => deletePool()} color="red">
            Slett
          </Button>
        </Box>
      </Flex>
    </Card>
  )
}

export const PoolBox: FC<PoolsBoxProps> = ({ pools }) => {
  const deletePoolMutation = useDeletePoolMutation()
  const deletePool = (pool: AttendancePoolDetails) => {
    if (pool.capacityUsed > 0) {
      notifyFail({
        title: "Feil",
        message: "Gruppen har deltakere, og kan ikke slettes",
      })
      return
    }

    deletePoolMutation.mutate({
      id: pool.id,
    })
  }

  return (
    <Grid columns={4}>
      {pools.map((pool) => (
        <AttendancePoolCard key={pool.id} pool={pool} deletePool={() => deletePool(pool)} />
      ))}
    </Grid>
  )
}
