import { Box, Button } from "@mantine/core"
import { openCreatePoolModal } from "./create-pool-modal"

interface EventAttendanceProps {
  attendanceId: string
  disabled?: boolean
}
export function usePoolsForm({ attendanceId, disabled }: EventAttendanceProps) {
  return function Form() {
    return (
      <Box>
        <Button
          mt={16}
          disabled={disabled}
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
