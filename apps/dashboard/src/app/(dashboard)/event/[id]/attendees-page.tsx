import type { Attendance } from "@dotkomonline/types"
import { Box, Divider, Title } from "@mantine/core"
import type { FC } from "react"
import { UserSearch } from "../../../../components/molecules/UserSearch/UserSearch"
import { AllAttendeesTable } from "../components/all-attendees-table"
import { openCreateManualUserAttendModal } from "../components/manual-user-attend-modal"
import { QrCodeScanner } from "../components/qr-code-scanner"
import { useEventAttendeesGetQuery } from "../queries"
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
  const { attendees, refetch } = useEventAttendeesGetQuery(attendance.id)
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
              onSuccess: refetch,
            })
          }}
          excludeUserIds={attendees.map((attendee) => attendee.userId)}
        />
      </Box>
      <Box>
        <Divider my={32} />
        <QrCodeScanner />
      </Box>
      <Box>
        <Title my={10} order={3}>
          Alle påmeldte
        </Title>
        <AllAttendeesTable attendees={attendees} attendance={attendance} refetch={refetch} />
      </Box>
    </Box>
  )
}
