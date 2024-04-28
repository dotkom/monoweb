import type { Attendance } from "@dotkomonline/types"
import { Box, Divider, Title } from "@mantine/core"
import type { FC } from "react"
import QrCodeScanner from "src/modules/attendance/components/attendance-page/QrCodeScanner"
import { UserSearch } from "../../../../components/molecules/UserSearch/UserSearch"
import { openCreateManualUserAttendModal } from "../../../../modules/attendance/modals/manual-user-attend-modal"
import { AllAttendeesTable } from "../all-users-table"
import { useEventDetailsContext } from "./provider"

export const AttendeesPage: FC = () => {
  const { attendance } = useEventDetailsContext()

  if (!attendance) {
    return <div>Arrangementet har ikke påmelding</div>
  }

  return <Page attendance={attendance} />
}

interface Props {
  attendance: Attendance
}

const Page: FC<Props> = ({ attendance }) => {
  return (
    <Box>
      <Box>
        <Title mb={10} order={3}>
          Meld på bruker
        </Title>
        <UserSearch
          onSubmit={(values) => {
            openCreateManualUserAttendModal({
              attendanceId: attendance.id,
              userId: values.id,
            })
          }}
        />
      </Box>
      <Divider my={32} />
      <QrCodeScanner attendanceId={attendance.id} />
      <Box>
        <Title mb={10} order={3}>
          Alle påmeldte
        </Title>
        <AllAttendeesTable attendanceId={attendance.id} />
      </Box>
    </Box>
  )
}
