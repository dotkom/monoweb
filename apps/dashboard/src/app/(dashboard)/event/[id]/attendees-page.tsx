import type { Attendance } from "@dotkomonline/types"
import { Box, Divider, Title } from "@mantine/core"
import type { FC } from "react"
import { UserSearch } from "../../../../components/molecules/UserSearch/UserSearch"
import { AllAttendeesTable } from "../components/all-users-table"
import { openCreateManualUserAttendModal } from "../components/manual-user-attend-modal"
import QrCodeScanner from "../components/qr-code-scanner"
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
