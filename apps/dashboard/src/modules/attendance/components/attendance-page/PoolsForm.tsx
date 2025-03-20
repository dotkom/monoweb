import type { AttendancePool } from "@dotkomonline/types"
import { Box, Button } from "@mantine/core"
import { openCreatePoolModal } from "../../modals/create-pool-modal"

interface EventAttendanceProps {
  attendanceId: string
  pools: AttendancePool[]
}
export function usePoolsForm({ attendanceId, pools }: EventAttendanceProps) {
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
      </Box>
    )
  }
}
