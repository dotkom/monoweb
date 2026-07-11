import { UserSearch } from "@/app/(internal)/brukere/components/user-search"
import type { Attendance } from "@dotkomonline/rpc/attendance"
import type { Event } from "@dotkomonline/rpc/event"
import type { FeedbackFormAnswer } from "@dotkomonline/rpc/feedback-form"
import { Anchor, Button, Group, List, ListItem, Space, Stack, Text, Title } from "@mantine/core"
import { skipToken } from "@tanstack/react-query"
import type { FC } from "react"
import { useEventEditPermission } from "@/hooks/use-event-edit-permission"
import { AllAttendeesTable } from "../components/all-attendees-table"
import { openManualCreateUserAttendModal } from "../components/manual-create-user-attend-modal"
import { openNotifyAttendeesModal } from "../components/notify-attendees-modal"
import { QrCodeScanner } from "../components/qr-code-scanner"
import { useEventFeedbackFormGetQuery, useFeedbackAnswersGetQuery } from "../queries"
import { useEventContext } from "./provider"

export const AttendeesPage: FC = () => {
  const { event, attendance } = useEventContext()
  const { data: feedbackForm } = useEventFeedbackFormGetQuery(event.id)
  const { data: feedbackAnswers } = useFeedbackAnswersGetQuery(feedbackForm?.id ?? skipToken)

  if (!attendance) {
    // TODO: Return something useful here
    return null
  }
  return <Page event={event} attendance={attendance} feedbackAnswers={feedbackAnswers} />
}

interface Props {
  event: Event
  attendance: Attendance
  feedbackAnswers?: FeedbackFormAnswer[]
}

const Page: FC<Props> = ({ event, attendance, feedbackAnswers }) => {
  const { canEdit } = useEventEditPermission()

  const attendees = attendance.attendees.filter((attendee) => attendee.user.email !== null)
  const attendeesWithoutEmail = attendance.attendees.filter((attendee) => !attendee.user.email)

  return (
    <Stack gap="xl">
      <Stack>
        <Title order={3}>Alle påmeldte</Title>

        <Stack>
          <Group>
            <Button
              variant="light"
              disabled={attendees.length === 0 || !canEdit}
              onClick={() => openNotifyAttendeesModal({ eventId: event.id, attendees })}
            >
              Send e-post til alle
            </Button>
          </Group>
          {attendeesWithoutEmail.length > 0 && (
            <Stack gap="xs">
              <Group gap={2}>
                <Text size="sm">Følgene påmeldte brukere har ikke registrert e-postadresse:</Text>
              </Group>
              <List size="xs" withPadding>
                {attendeesWithoutEmail.map((attendee) => (
                  <ListItem key={attendee.id}>
                    <Anchor size="xs" href={`/brukere/${attendee.user.id}`}>
                      {attendee.user.name} ({attendee.user.username})
                    </Anchor>
                  </ListItem>
                ))}
              </List>
            </Stack>
          )}
        </Stack>

        <UserSearch
          placeholder="Meld på bruker"
          excludeUserIds={attendance.attendees.map((attendee) => attendee.userId)}
          disabled={!canEdit}
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
        <QrCodeScanner attendance={attendance} disabled={!canEdit} />
      </Stack>

      <Stack>
        <Title order={3}>Påmeldte</Title>
        <AllAttendeesTable
          attendees={attendees}
          attendance={attendance}
          feedbackAnswers={feedbackAnswers}
          canEdit={canEdit}
        />
      </Stack>

      <Space h="xl" />
    </Stack>
  )
}
