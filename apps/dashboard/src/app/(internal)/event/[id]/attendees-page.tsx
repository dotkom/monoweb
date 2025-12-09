import type { Attendance, Event, FeedbackFormAnswer } from "@dotkomonline/types"
import { Anchor, Button, Group, List, ListItem, Space, Stack, Text, Title } from "@mantine/core"
import { skipToken } from "@tanstack/react-query"
import type { FC } from "react"
import { UserSearch } from "@/app/(internal)/user/components/user-search"
import { AllAttendeesTable } from "../components/all-attendees-table"
import { openManualCreateUserAttendModal } from "../components/manual-create-user-attend-modal"
import { QrCodeScanner } from "../components/qr-code-scanner"
import { useEventFeedbackFormGetQuery, useFeedbackAnswersGetQuery } from "../queries"
import { useEventContext } from "./provider"

const getMailTo = (eventTitle: string, emails: (string | null)[]) => {
  return `mailto:?bcc=${emails.filter(Boolean).join(",")}&subject=(${eventTitle}) Melding fra arrangør`
}

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
  const attendees = attendance.attendees.filter((attendee) => attendee.user.email !== null)
  const attendeesWithoutEmail = attendance.attendees.filter((attendee) => !attendee.user.email)

  return (
    <Stack gap="xl">
      <Stack>
        <Title order={3}>Alle påmeldte</Title>

        <Stack>
          <Group>
            <Button
              component="a"
              variant="light"
              disabled={attendees.length === 0 || attendees.length === attendeesWithoutEmail.length}
              target="_blank"
              rel="noopener noreferrer"
              href={getMailTo(
                event.title,
                attendees.map((attendee) => attendee.user.email)
              )}
            >
              Send e-post til alle
            </Button>
            <Button
              component="a"
              variant="light"
              disabled={attendees.length === 0 || attendees.length === attendeesWithoutEmail.length}
              target="_blank"
              rel="noopener noreferrer"
              href={getMailTo(
                event.title,
                attendees.filter((attendee) => attendee.reserved).map((attendee) => attendee.user.email)
              )}
            >
              Send e-post til påmeldte (uten venteliste)
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
                    <Anchor size="xs" href={`/user/${attendee.user.id}`}>
                      {attendee.user.name} ({attendee.user.profileSlug})
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
        <QrCodeScanner attendance={attendance} />
      </Stack>

      <Stack>
        <Title order={3}>Påmeldte</Title>
        <AllAttendeesTable attendees={attendees} attendance={attendance} feedbackAnswers={feedbackAnswers} />
      </Stack>

      <Space h="xl" />
    </Stack>
  )
}
