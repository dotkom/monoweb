import type { Attendance } from "@dotkomonline/types"
import { Box, Divider, Title } from "@mantine/core"
import type { FC } from "react"
import { UserSearch } from "../../../../components/molecules/UserSearch/UserSearch"
import { openCreateManualUserAttendModal } from "../../../../modules/attendance/modals/manual-user-attend-modal"
import { useEventAttendeesGetQuery } from "../../../../modules/attendance/queries/use-get-queries"
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
  const { attendees } = useEventAttendeesGetQuery(attendance.id)

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
      <Box>
        <Title mb={10} order={3}>
          Alle påmeldte
        </Title>
        <AllAttendeesTable users={attendees} attendanceId={attendance.id} />
      </Box>
    </Box>
  )
}
