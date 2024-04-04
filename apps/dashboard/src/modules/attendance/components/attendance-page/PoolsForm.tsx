import { Box, Button } from "@mantine/core"
import { openCreatePoolModal } from "../../modals/create-pool-modal"
import { openMergePoolsModal } from "../../modals/merge-pools-modal"
import { AttendancePool } from "@dotkomonline/types"

interface EventAttendanceProps {
  attendanceId: string
  pools: AttendancePool[]
}
export function usePoolsForm({ attendanceId, pools }: EventAttendanceProps) {
  const attendanceIsMerged = pools.filter((pool) => pool.active && pool.type === "MERGE").length === 1

  return function Form() {
    return (
      <Box>
        <Button
          disabled={attendanceIsMerged}
          mt={16}
          onClick={openCreatePoolModal({
            attendanceId,
          })}
        >
          Opprett ny påmeldingsgruppe
        </Button>
        <Button
          disabled={attendanceIsMerged}
          mt={16}
          ml={16}
          onClick={openMergePoolsModal({
            attendanceId,
          })}
        >
          Slå sammen påmeldingsgrupper
        </Button>
      </Box>
    )
  }
}
