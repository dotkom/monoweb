import { Box, Button } from "@mantine/core"
import { openCreatePoolModal } from "./create-pool-modal"

interface EventAttendanceProps {
  attendanceId: string
}
export function usePoolsForm({ attendanceId }: EventAttendanceProps) {
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
