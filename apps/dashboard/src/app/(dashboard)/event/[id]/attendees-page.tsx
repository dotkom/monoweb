import { type Attendance, type UserIDP } from "@dotkomonline/types"
import { Box, Divider, Title } from "@mantine/core"
import { type FC } from "react"
import { useEventDetailsContext } from "./provider"
import { UserSearch } from "../../../../components/molecules/UserSearch/UserSearch"
import { useRegisterForEventMutation } from "../../../../modules/attendance/mutations/use-register-for-event-mutation"
import { useEventAttendeesGetQuery } from "../../../../modules/attendance/queries/use-event-attendees-get-query"
import { trpc } from "../../../../utils/trpc"
import { AllAttendeesTable } from "../all-users-table"

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
  const getUser = trpc.user.getBySubAsync.useMutation()

  const handleAttendUser = async (user: UserIDP) => {
    const dbUser = await getUser.mutateAsync(user.subject)
    if (dbUser === undefined) {
      throw new Error("db user not found")
    }

    registerForEvent.mutate({ attendanceId: attendance.id, userId: dbUser.id })
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
