import { type UserIDP } from "@dotkomonline/types"
import { Box, Divider, Title } from "@mantine/core"
import { type FC } from "react"
import { useEventDetailsContext } from "./provider"
import { UserSearch } from "../../../../components/molecules/UserSearch/UserSearch"
import { useRegisterForEventMutation } from "../../../../modules/event/mutations/use-register-for-event-mutation"
import { useEventAttendanceGetQuery } from "../../../../modules/event/queries/use-event-attendance-get-query"
import { trpc } from "../../../../utils/trpc"
import { notifyFail } from "../../../notifications"
import { AllAttendeesTable } from "../all-users-table"

export const EventAttendancePage: FC = () => {
  const { event } = useEventDetailsContext()
  const { eventAttendance } = useEventAttendanceGetQuery(event.id)
  const registerForEvent = useRegisterForEventMutation()
  const dbUserMut = trpc.user.getBySubAsync.useMutation()

  const handleAttendUser = async (user: UserIDP) => {
    const dbUser = await dbUserMut.mutateAsync(user.subject)

    if (!dbUser) {
      notifyFail({
        title: "Feil",
        message: "Fant ikke brukeren i databasen",
      })

      return
    }

    const userAlreadyRegistered = eventAttendance.some((pool) =>
      pool.attendees.some((attendee) => attendee.userId === dbUser.id)
    )

    if (userAlreadyRegistered) {
      notifyFail({
        title: "Feil",
        message: "Brukeren er allerede påmeldt",
      })
      return
    }

    const pool = eventAttendance.find((pool) => pool.min <= dbUser.studyYear && pool.max > dbUser.studyYear)

    if (!pool) {
      notifyFail({
        title: "Feil",
        message: "Fant ingen pool for brukeren",
      })
      return
    }

    registerForEvent.mutate({ poolId: pool.id, userId: dbUser.id.toString() })
  }
  const allAttendees = []
  for (const pool of eventAttendance) {
    for (const attendee of pool.attendees) {
      allAttendees.push(attendee)
    }
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
        <AllAttendeesTable users={allAttendees} />
      </Box>
    </Box>
  )
}
