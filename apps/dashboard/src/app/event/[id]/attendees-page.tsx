import { UserSearch } from "@/app/user/components/user-search"
import type { Attendance } from "@dotkomonline/types"
import { Button, Group, Stack, Title } from "@mantine/core"
import type { FC } from "react"
import { AllAttendeesTable } from "../components/all-attendees-table"
import { openManualCreateUserAttendModal } from "../components/manual-create-user-attend-modal"
import { QrCodeScanner } from "../components/qr-code-scanner"
import { useEventContext } from "./provider"

export const AttendeesPage: FC = () => {
  const { attendance } = useEventContext()
  if (!attendance) {
    // TODO: Return something useful here
    return null
  }
  return <Page attendance={attendance} />
}

interface Props {
  attendance: Attendance
}

const Page: FC<Props> = ({ attendance }) => {
  const attendees = attendance.attendees.filter((attendee) => attendee.user.email !== null)
  return (
    <Stack gap="xl">
      <Stack>
        <Title order={3}>Alle påmeldte</Title>

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

        <UserSearch
          placeholder="Meld på bruker"
          excludeUserIds={attendance.attendees.map((attendee) => attendee.userId)}
          onSubmit={(values) => {
            openManualCreateUserAttendModal({
              attendanceId: attendance.id,
              userId: values.id,
            })
          }}
        />
      </Stack>

      <Stack>
        <Title order={3}>Oppmøteregistrering</Title>
        <QrCodeScanner />
      </Stack>

      <Stack>
        <Title order={3}>Påmeldte</Title>
        <AllAttendeesTable attendees={Array(100).fill(attendees).flat()} attendance={attendance} />
      </Stack>
    </Stack>
  )
}
