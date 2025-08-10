import { UserSearch } from "@/app/user/components/user-search"
import type { Attendance } from "@dotkomonline/types"
import { Button, Group, Stack, Title } from "@mantine/core"
import type { FC } from "react"
import { AllAttendeesTable } from "../components/all-attendees-table"
import { openManualCreateUserAttendModal } from "../components/manual-create-user-attend-modal"
import { QrCodeScanner } from "../components/qr-code-scanner"
import { useAttendanceGetQuery, useEventAttendeesGetQuery } from "../queries"
import { useEventContext } from "./provider"

export const AttendeesPage: FC = () => {
  const event = useEventContext()
  const attendance = useAttendanceGetQuery(event.attendanceId as string, event.attendanceId !== null)
  if (event.attendanceId === null || attendance.isLoading || attendance.data === undefined) {
    // TODO: Return something useful here
    return null
  }
  return <Page attendance={attendance.data} />
}

interface Props {
  attendance: Attendance
}

const Page: FC<Props> = ({ attendance }) => {
  const { attendees } = useEventAttendeesGetQuery(attendance.id)
  return (
    <Stack gap="xl">
      <Stack gap="xs">
        <Title mb={10} order={3}>
          Meld på bruker
        </Title>
        <UserSearch
          onSubmit={(values) => {
            openManualCreateUserAttendModal({
              attendanceId: attendance.id,
              userId: values.id,
            })
          }}
          excludeUserIds={attendees.map((attendee) => attendee.userId)}
        />
      </Stack>

      <Stack>
        <Title my={10} order={3}>
          Alle påmeldte
        </Title>
        <Group>
          <Button component="a" href={`mailto:${attendees.map((attendee) => attendee.user.email).join(",")}`}>
            Send e-post til alle
          </Button>
          <Button
            component="a"
            href={`mailto:${attendees
              .filter((attendee) => attendee.reserved)
              .map((attendee) => attendee.user.email)
              .join(",")}`}
          >
            Send e-post til påmeldte (uten venteliste)
          </Button>
        </Group>
        <AllAttendeesTable attendees={attendees} attendance={attendance} />
      </Stack>

      <Stack>
        <Title my={10} order={3}>
          Registrer oppmøte med QR-kode
        </Title>
        <QrCodeScanner />
      </Stack>
    </Stack>
  )
}
