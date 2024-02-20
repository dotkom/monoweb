import { type UserIDP } from "@dotkomonline/types"
import { Box, Button, Card, Divider, Text, Title } from "@mantine/core"
import { type FC } from "react"
import { z } from "zod"
import { useEventDetailsContext } from "./provider"
import { UserSearch } from "../../../../components/molecules/UserSearch/UserSearch"
import { useCreatePoolModal } from "../../../../modules/event/modals/create-pool-modal"
import { useRegisterForEventMutation } from "../../../../modules/event/mutations/use-register-for-event-mutation"
import { useEventAttendanceGetQuery } from "../../../../modules/event/queries/use-event-attendance-get-query"
import { trpc } from "../../../../utils/trpc"
import { createDateTimeInput, useFormBuilder } from "../../../form"
import { notifyFail } from "../../../notifications"
import { PoolsTable } from "../pools-table"

export const EventAttendancePage: FC = () => {
  const { event } = useEventDetailsContext()
  const { eventAttendance } = useEventAttendanceGetQuery(event.id)
  const registerForEvent = useRegisterForEventMutation()
  const dbUserMut = trpc.user.getBySubAsync.useMutation()
  const openPoolModal = useCreatePoolModal({ eventId: event.id, existingPools: eventAttendance })

  const GeneralAttributesForm = useFormBuilder({
    schema: z.object({
      attendanceStart: z.date(),
      attendanceEnd: z.date(),
      poolMergeTime: z.date(),
    }),
    defaultValues: {
      attendanceStart: new Date(),
      attendanceEnd: new Date(),
      poolMergeTime: new Date(),
    },
    onSubmit: (values) => {
      console.log(values)
    },
    label: "Lagre",
    fields: {
      attendanceStart: createDateTimeInput({
        label: "Påmeldingsstart",
      }),
      attendanceEnd: createDateTimeInput({
        label: "Påmeldingsslutt",
      }),
      poolMergeTime: createDateTimeInput({
        label: "Gruppemerging",
      }),
    },
  })

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
          Generelt
        </Title>
        <GeneralAttributesForm />
      </Box>
      <Divider my={32} />
      <Box>
        <Title mb={10} order={3}>
          Puljer
        </Title>
        <Button onClick={openPoolModal}>Opprett ny pulje</Button>
      </Box>
      <Box>
        {eventAttendance.map((attendance) => (
          <Card shadow="sm" padding="lg" radius="md" withBorder key={attendance.id} mt={16}>
            <PoolsTable attendance={attendance} />
          </Card>
        ))}
        {eventAttendance.length === 0 && <Text fs="italic">Ingen puljer</Text>}
      </Box>
    </Box>
  )
}
