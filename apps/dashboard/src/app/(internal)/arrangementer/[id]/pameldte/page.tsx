"use client"

import { UserSearch } from "@/app/(internal)/brukere/components/UserSearch"
import type { Attendance } from "@dotkomonline/rpc/attendance"
import type { Event } from "@dotkomonline/rpc/event"
import type { FeedbackFormAnswer } from "@dotkomonline/rpc/feedback-form"
import { Button, Text, TextLink, Title } from "@dotkomonline/ui"
import { skipToken } from "@tanstack/react-query"
import { useState } from "react"
import { useEventContext } from "../provider"
import { useEventFeedbackFormGetQuery, useFeedbackAnswersGetQuery } from "../../queries"
import { useEventEditPermission } from "../../use-event-edit-permission"
import { SendNotificationModal } from "@/app/(internal)/varslinger/components/send-notification-modal"
import { AttendeesTable } from "./components/AttendeesTable"
import { ManualCreateUserAttendModal } from "./components/ManualCreateUserAttendModal"
import { QrCodeScanner } from "./components/QrCodeScanner"

export default function EventAttendeesPage() {
  const { event, attendance } = useEventContext()
  const { data: feedbackForm } = useEventFeedbackFormGetQuery(event.id)
  const { data: feedbackAnswers } = useFeedbackAnswersGetQuery(feedbackForm?.id ?? skipToken)

  if (!attendance) {
    return <Text>Du må legge til en påmelding før du kan se påmeldte.</Text>
  }

  return <Page event={event} attendance={attendance} feedbackAnswers={feedbackAnswers} />
}

interface Props {
  event: Event
  attendance: Attendance
  feedbackAnswers?: FeedbackFormAnswer[]
}

const Page = ({ event, attendance, feedbackAnswers }: Props) => {
  const { canEdit } = useEventEditPermission()
  const [notifyOpen, setNotifyOpen] = useState(false)
  const [manualCreate, setManualCreate] = useState<{ userId: string } | null>(null)

  const attendees = attendance.attendees.filter((attendee) => attendee.user.email !== null)
  const attendeesWithoutEmail = attendance.attendees.filter((attendee) => !attendee.user.email)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Title size="md">Alle påmeldte</Title>

        <div className="flex flex-col gap-2">
          <Button
            variant="secondary"
            className="w-fit"
            disabled={attendance.attendees.length === 0 || !canEdit}
            onClick={() => setNotifyOpen(true)}
          >
            Send melding til påmeldte
          </Button>
          {attendeesWithoutEmail.length > 0 && (
            <div className="flex flex-col gap-1">
              <Text className="text-sm">Følgene påmeldte brukere har ikke registrert e-postadresse:</Text>
              <ul className="list-inside list-disc text-xs">
                {attendeesWithoutEmail.map((attendee) => (
                  <li key={attendee.id}>
                    <TextLink href={`/brukere/${attendee.user.id}`} className="text-xs">
                      {attendee.user.name} ({attendee.user.username})
                    </TextLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <UserSearch
          placeholder="Meld på bruker"
          excludeUserIds={attendance.attendees.map((attendee) => attendee.userId)}
          disabled={!canEdit}
          onSubmit={(values) => {
            setManualCreate({ userId: values.id })
          }}
        />
      </div>

      <div className="flex flex-col gap-4">
        <Title size="md">Oppmøteregistrering</Title>
        <QrCodeScanner attendance={attendance} disabled={!canEdit} />
      </div>

      <div className="flex flex-col gap-4">
        <Title size="md">Påmeldte</Title>
        <AttendeesTable
          attendees={attendees}
          attendance={attendance}
          feedbackAnswers={feedbackAnswers}
          canEdit={canEdit}
        />
      </div>

      <div className="h-8" />

      <SendNotificationModal
        open={notifyOpen}
        onOpenChange={setNotifyOpen}
        source={{
          kind: "EVENT",
          eventId: event.id,
          attendanceId: attendance.id,
          eventTitle: event.title,
          hostingGroupSlugs: event.hostingGroups.map((group) => group.slug),
          hasPayment: attendance.attendancePrice !== null,
          selections: attendance.selections,
        }}
      />

      {manualCreate && (
        <ManualCreateUserAttendModal
          open={Boolean(manualCreate)}
          onOpenChange={(open) => {
            if (!open) {
              setManualCreate(null)
            }
          }}
          attendanceId={attendance.id}
          eventId={event.id}
          userId={manualCreate.userId}
        />
      )}
    </div>
  )
}
