import { AttendancePool } from "@dotkomonline/types"
import { Box, Button, Card, Flex, Text } from "@mantine/core"
import { FC } from "react"
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

const NormalPoolBox: FC<NormalPoolBoxProps> = ({ pool, attendanceId, deleteGroup }) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder key={pool.id} mt={16} bg={pool.isVisible ? "white" : "gray"}>
      <Flex justify="space-between">
        <Box>
          <Text>{pool.title}</Text>
          <Text>
            Deltagere {pool.numAttendees} / {pool.capacity}
          </Text>
        </Box>
        <Box>
          <Button
            onClick={openEditPoolModal({
              attendanceId,
              defaultValues: {
                capacity: pool.capacity,
                title: pool.title,
                yearCriteria: pool.yearCriteria,
                isVisible: pool.isVisible,
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

interface MergePoolBoxProps {
  pool: AttendancePool
  attendanceId: string
  deleteGroup: (id: string, numAttendees: number) => void
}

const MergePoolBox: FC<MergePoolBoxProps> = ({ pool, attendanceId, deleteGroup }) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder key={pool.id} mt={16} bg={pool.isVisible ? "white" : "gray"}>
      <Flex justify="space-between">
        <Box>
          <Text>{pool.title}</Text>
          <Text>
            Deltagere {pool.numAttendees} / {pool.capacity}
          </Text>
        </Box>
        <Box>
          <Button
            onClick={openEditPoolModal({
              attendanceId,
              defaultValues: {
                capacity: pool.capacity,
                title: pool.title,
                yearCriteria: pool.yearCriteria,
                isVisible: pool.isVisible,
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

  const Pool: FC<{ pool: AttendancePool }> = ({ pool }) => {
    if (pool.type === "NORMAL") {
      return <NormalPoolBox key={pool.id} pool={pool} deleteGroup={deleteGroup} attendanceId={attendanceId} />
    }
    if (pool.type === "MERGE") {
      return <MergePoolBox key={pool.id} pool={pool} deleteGroup={deleteGroup} attendanceId={attendanceId} />
    }

    return <div>Something went wrong</div>
  }

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
      {pools?.map((pool) => (
        <Pool key={pool.id} pool={pool} />
      ))}
      {pools?.length === 0 && <Text fs="italic">Ingen påmeldingsgrupper</Text>}
    </Box>
  )
}
