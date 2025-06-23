import type { Attendance } from "@dotkomonline/types"
import { Stack, Title } from "@mantine/core"
import type { FC } from "react"
import { UserSearch } from "../../../../components/molecules/UserSearch/UserSearch"
import { AllAttendeesTable } from "../components/all-attendees-table"
import { openCreateManualUserAttendModal } from "../components/manual-user-attend-modal"
import { QrCodeScanner } from "../components/qr-code-scanner"
import { useEventAttendeesGetQuery } from "../queries"
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
    <Stack gap="xl">
      <Stack gap="xs">
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
          excludeUserIds={attendees.map((attendee) => attendee.userId)}
        />
      </Stack>

      <Stack>
        <Title my={10} order={3}>
          Registrer oppmøte med QR-kode
        </Title>
        <QrCodeScanner />
      </Stack>

      <Stack>
        <Title my={10} order={3}>
          Alle påmeldte
        </Title>
        <AllAttendeesTable attendees={attendees} attendance={attendance} />
      </Stack>
    </Stack>
  )
}
