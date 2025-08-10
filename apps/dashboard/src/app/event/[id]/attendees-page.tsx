import { UserSearch } from "@/app/user/components/user-search"
import type { Attendance } from "@dotkomonline/types"
import { Stack, Title } from "@mantine/core"
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
          excludeUserIds={attendance.attendees.map((attendee) => attendee.userId)}
        />
      </Stack>

      <Stack>
        <Title my={10} order={3}>
          Alle påmeldte
        </Title>
        <AllAttendeesTable attendees={attendance.attendees} attendance={attendance} />
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
