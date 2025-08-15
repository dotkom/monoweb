import { UserSearch } from "@/app/user/components/user-search"
import type { Attendance } from "@dotkomonline/types"
import { Button, Flex, Group, Stack, Title } from "@mantine/core"
import type { FC } from "react"
import { AllAttendeesTable } from "../components/all-attendees-table"
import { openManualCreateUserAttendModal } from "../components/manual-create-user-attend-modal"
import { QrCodeScanner } from "../components/qr-code-scanner"
import { useAttendanceGetQuery } from "../queries"
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
  const attendees = attendance.attendees.filter((attendee) => attendee.user.email !== null)
  return (
    <Stack gap="xl">
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
      <Flex rowGap="xl" columnGap="sm" wrap="wrap">
        <Stack>
          <Title order={3}>QR-code</Title>
          <QrCodeScanner />
        </Stack>

        <Stack>
          <Title order={3}>Påmeldte</Title>
          <AllAttendeesTable attendees={Array(100).fill(attendees).flat()} attendance={attendance} />
        </Stack>
      </Flex>
    </Stack>
  )
}
