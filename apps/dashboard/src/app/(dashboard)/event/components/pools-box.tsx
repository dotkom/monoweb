import type { AttendancePool } from "@dotkomonline/types"
import { Box, Button, Card, Flex, Text } from "@mantine/core"
import type { FC } from "react"
import { notifyFail } from "../../../notifications"
import { useDeletePoolMutation } from "../mutations"
import { openEditPoolModal } from "./edit-pool-modal"

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
        <AttendancePoolCard key={pool.id} pool={pool} deleteGroup={deleteGroup} attendanceId={attendanceId} />
      ))}
      {pools?.length === 0 && <Text fs="italic">Ingen påmeldingsgrupper</Text>}
    </Box>
  )
}
