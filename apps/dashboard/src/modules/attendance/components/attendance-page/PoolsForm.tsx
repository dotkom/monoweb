import { type AttendancePool } from "@dotkomonline/types"
import { Box, Button, Card, Flex, Text } from "@mantine/core"
import { notifyFail } from "../../../../app/notifications"
import { openCreatePoolModal } from "../../modals/create-pool-modal"
import { openEditPoolModal } from "../../modals/edit-pool-modal"
import { useDeletePoolMutation } from "../../mutations/use-pool-mutations"

interface EventAttendanceProps {
  pools: AttendancePool[]
  attendanceId: string
}
export function usePoolsForm({ pools, attendanceId }: EventAttendanceProps) {
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

  return function Form() {
    return (
      <Box>
        <Button
          mt={16}
          onClick={openCreatePoolModal({
            attendanceId,
          })}
        >
          Opprett ny påmeldingsgruppe
        </Button>
        <Box>
          {pools?.map((pool) => (
            <Card shadow="sm" padding="lg" radius="md" withBorder key={pool.id} mt={16}>
              <Flex justify="space-between">
                <Box>
                  <Text>{pool.title}</Text>
                  <Text>
                    Reserverte plasser: {pool.numAttendees} / {pool.limit}
                  </Text>
                </Box>
                <Box>
                  <Button
                    onClick={openEditPoolModal({
                      attendanceId,
                      defaultValues: {
                        limit: pool.limit,
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
          ))}
          {pools?.length === 0 && <Text fs="italic">Ingen påmeldingsgrupper</Text>}
        </Box>
      </Box>
    )
  }
}
