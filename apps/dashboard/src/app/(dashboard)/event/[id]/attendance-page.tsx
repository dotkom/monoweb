import { type UserIDP } from "@dotkomonline/types"
import { Box, Divider, Title } from "@mantine/core"
import { type FC } from "react"
import { useEventDetailsContext } from "./provider"
import { UserSearch } from "../../../../components/molecules/UserSearch/UserSearch"
import { useRegisterForEventMutation } from "../../../../modules/event/mutations/use-register-for-event-mutation"
import { useEventAttendeesGetQuery } from "../../../../modules/event/queries/use-event-attendees-get-query"
import { trpc } from "../../../../utils/trpc"
import { AllAttendeesTable } from "../all-users-table"

export const EventAttendancePage: FC = () => {
  const { attendance } = useEventDetailsContext()
  const { attendees } = useEventAttendeesGetQuery(attendance?.id || "")
  const registerForEvent = useRegisterForEventMutation()
  const dbUserMut = trpc.user.getBySubAsync.useMutation()

  const handleAttendUser = async (user: UserIDP) => {
    if (attendance === null) {
      throw new Error("Attendance is null")
    }

    const dbUser = await dbUserMut.mutateAsync(user.subject)
    if (dbUser === undefined) {
      throw new Error("Attendance is null")
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
