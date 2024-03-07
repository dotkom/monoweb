import { User, type Attendance } from "@dotkomonline/types"
import { Box, Divider, Title } from "@mantine/core"
import { type FC } from "react"
import { useEventDetailsContext } from "./provider"
import { UserSearch } from "../../../../components/molecules/UserSearch/UserSearch"
import { AllAttendeesTable } from "../all-users-table"
import { useGetUserBySub } from "../../../../modules/user/queries/use-user-get-query"
import { useEventAttendeesGetQuery } from "../../../../modules/attendance/queries/use-get-queries"
import { useRegisterForEventMutation } from "../../../../modules/attendance/mutations/use-attendee-mutations"

export const AttendeesPage: FC = () => {
  const { attendance } = useEventDetailsContext()

  if (!attendance) {
    return <div>Ingen påmelding</div>
  }

  return <Page attendance={attendance} />
}

interface Props {
  attendance: Attendance
}

const Page: FC<Props> = ({ attendance }) => {
  const { attendees } = useEventAttendeesGetQuery(attendance.id)
  const registerForEvent = useRegisterForEventMutation()

  const handleAttendUser = async (user: User) => {
    registerForEvent.mutate({ attendanceId: attendance.id, userId: user.id })
  }

  return (
    <Box>
      <Box>
        <Title mb={10} order={3}>
          Meld på bruker
        </Title>
        <UserSearch onSubmit={handleAttendUser} />
      </Box>
      <Divider my={32} />
      <Box>
        <Title mb={10} order={3}>
          Alle påmeldte
        </Title>
        <AllAttendeesTable users={attendees} />
      </Box>
    </Box>
  )
}
