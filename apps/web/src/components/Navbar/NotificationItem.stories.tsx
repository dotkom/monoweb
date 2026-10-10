import type { Article } from "@dotkomonline/rpc/article"
import type { Group } from "@dotkomonline/rpc/group"
import type { InterestGroupEventSummary } from "@dotkomonline/rpc/interest-group-event"
import type { JobListing } from "@dotkomonline/rpc/job-listing"
import { getNotificationTypeLabel, type NotificationType, NotificationTypeSchema } from "@dotkomonline/rpc/notification"
import type { Offline } from "@dotkomonline/rpc/offline"
import { Text } from "@dotkomonline/ui"
import { subHours } from "date-fns"
import { type ReactNode, useState } from "react"
import {
  createMockAttendanceSummary,
  createMockAttendee,
  createMockEvent,
  createMockUser,
} from "../../../.ladle/fixtures/attendance"
import { NotificationItem, type NotificationItemNotification } from "./NotificationItem"
import {
  NotificationArticlePayload,
  NotificationEventPayload,
  NotificationGroupPayload,
  NotificationInterestGroupEventPayload,
  NotificationJobListingPayload,
  NotificationOfflinePayload,
  NotificationUrlPayload,
  NotificationUserPayload,
} from "./NotificationPayload"

export default {
  title: "Navbar/Notification Item",
  component: NotificationItem,
}

const actorGroup: NotificationItemNotification["actorGroup"] = {
  abbreviation: "Hovedstyret",
  name: "Hovedstyret",
  preferredDisplayName: "NAME",
}

function createNotification(overrides: Partial<NotificationItemNotification> = {}): NotificationItemNotification {
  return {
    id: "notification-story",
    title: "Påminnelse om prikkeregler",
    shortDescription: "I Online har vi prikkeregler som bestemmer hvor mange prikker du får dersom du ikke møter opp.",
    type: "BROADCAST",
    createdAt: subHours(new Date(), 2),
    actorGroup,
    ...overrides,
  }
}

const event = createMockEvent({
  title: "Ping med Bekk",
  imageUrl: "https://placehold.co/160x100/bae6fd/0c4a6e?text=Bekk",
})
const attendance = createMockAttendanceSummary()

const article: Pick<Article, "id" | "imageUrl" | "slug" | "tags" | "title"> = {
  id: "article-online-kjoper-scandic",
  slug: "online-kjoper-scandic",
  title: "Online kjøper Scandic Lerkendal",
  imageUrl: "https://placehold.co/160x100/dbeafe/1e3a8a?text=Online",
  tags: [{ name: "Online" }, { name: "Nyheter" }, { name: "Scandic" }],
}

const offline: Pick<Offline, "fileUrl" | "imageUrl" | "title"> = {
  title: "Offline #67",
  fileUrl: "https://online.ntnu.no/offline/67",
  imageUrl: "https://placehold.co/100x130/fde68a/78350f?text=%2367",
}

const group: Pick<Group, "abbreviation" | "description" | "imageUrl" | "name" | "preferredDisplayName" | "slug"> = {
  abbreviation: "Dotkom",
  name: "Drifts- og utviklingskomiteen",
  preferredDisplayName: "ABBREVIATION",
  slug: "dotkom",
  description: "Komiteen som utvikler og drifter Onlines nettsider og interne systemer.",
  imageUrl: "https://placehold.co/100x100/dbeafe/1e3a8a?text=DK",
}

const attendee = createMockAttendee({
  id: "attendee-hans",
  userId: "hans",
  userGrade: 2,
  user: createMockUser({
    id: "hans",
    username: "hanshansen",
    name: "Hans Hansen",
    imageUrl: "https://placehold.co/100x100/e0e7ff/312e81?text=HH",
  }),
})

const company: JobListing["company"] = {
  id: "bekk",
  name: "Bekk",
  slug: "bekk",
  description: null,
  phone: null,
  email: null,
  website: "https://bekk.no",
  location: "Trondheim",
  imageUrl: "https://placehold.co/100x100/f5f5f4/1c1917?text=Bekk",
  createdAt: new Date(),
  updatedAt: new Date(),
}

const jobListing: Pick<JobListing, "company" | "id" | "title"> = {
  id: "jobb-bekk",
  title: "Sommerjobb som utvikler",
  company,
}

const interestGroupEvent: InterestGroupEventSummary = {
  id: "interest-group-event-surf",
  title: "Surfetur til Stadlandet",
  imageUrl: "https://placehold.co/100x100/bae6fd/0c4a6e?text=Surf",
  start: new Date(),
  status: "PUBLISHED" as const,
  interestGroup: {
    abbreviation: "X-Sport",
    name: "X-Sport",
    preferredDisplayName: "NAME" as const,
    slug: "x-sport",
    type: "INTEREST_GROUP" as const,
    shortDescription: "Surfetur til Stadlandet",
    description: "Surfetur til Stadlandet",
    imageUrl: "https://placehold.co/100x100/bae6fd/0c4a6e?text=Surf",
    email: "surf@x-sport.no",
    contactUrl: "https://x-sport.no",
    slackUrl: "https://x-sport.no",
    showLeaderAsContact: true,
    createdAt: new Date(),
    deactivatedAt: null,
    workspaceGroupId: "workspace-group-id",
    memberVisibility: "ALL_MEMBERS" as const,
    recruitmentMethod: "SPRING_APPLICATION" as const,
    roles: [],
    eventCount: 0,
  },
  registrations: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  description: "Surfetur til Stadlandet",
  end: new Date(),
  locationTitle: "Stadlandet",
  locationAddress: "Stadlandet",
  locationLink: "https://stadlandet.no",
  registerEnd: new Date(),
  deregisterDeadline: new Date(),
  interestGroupId: "interest-group-id",
}

function StoryFrame({ children }: { children: ReactNode }) {
  return <div className="w-full max-w-96">{children}</div>
}

function NotificationTypeRow({
  label,
  notification,
  renderPayload,
}: {
  label: string
  notification: NotificationItemNotification
  renderPayload?: () => ReactNode
}) {
  const [readAt, setReadAt] = useState<Date | null>(null)
  let unreadPayload: ReactNode
  let readPayload: ReactNode

  if (renderPayload !== undefined) {
    unreadPayload = renderPayload()
    readPayload = renderPayload()
  }

  return (
    <div className="flex flex-col gap-2">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <div className="grid max-w-5xl grid-cols-1 items-start gap-4 md:grid-cols-2">
        <StoryFrame>
          <NotificationItem
            notification={notification}
            readAt={readAt}
            onMarkAsRead={() => {
              setReadAt(new Date())
            }}
          >
            {unreadPayload}
          </NotificationItem>
        </StoryFrame>
        <StoryFrame>
          <NotificationItem notification={notification} readAt={new Date()}>
            {readPayload}
          </NotificationItem>
        </StoryFrame>
      </div>
    </div>
  )
}

export function Broadcast() {
  return <NotificationTypeRow label="Broadcast" notification={createNotification()} renderPayload={() => null} />
}

export function BroadcastImportant() {
  return (
    <NotificationTypeRow
      label={getNotificationTypeLabel("BROADCAST_IMPORTANT")}
      notification={createNotification({
        title: "Viktig informasjon fra Hovedstyret",
        shortDescription: "Les informasjonen og bekreft at du har sett varslingen.",
        type: "BROADCAST_IMPORTANT",
      })}
    />
  )
}

function EventNotificationPreview({
  type,
  title,
  shortDescription,
}: {
  type: NotificationType
  title: string
  shortDescription: string
}) {
  return (
    <NotificationTypeRow
      label={getNotificationTypeLabel(type)}
      notification={createNotification({ type, title, shortDescription, actorGroup: null })}
      renderPayload={() => <NotificationEventPayload event={event} attendance={attendance} />}
    />
  )
}

export function EventReminder() {
  return (
    <EventNotificationPreview
      type="EVENT_REMINDER"
      title="Ping med Bekk starter snart"
      shortDescription="Husk arrangementet du er påmeldt. Vi gleder oss til å se deg!"
    />
  )
}

export function AttendanceRegistration() {
  return (
    <EventNotificationPreview
      type="ATTENDANCE_REGISTRATION"
      title="Du er påmeldt Ping med Bekk"
      shortDescription="Påmeldingen din er bekreftet. Se arrangementet for praktisk informasjon."
    />
  )
}

export function AttendanceDeregistration() {
  return (
    <EventNotificationPreview
      type="ATTENDANCE_DEREGISTRATION"
      title="Du er avmeldt Ping med Bekk"
      shortDescription="Du har ikke lenger en plass på arrangementet."
    />
  )
}

export function AttendanceRegisteredFromQueue() {
  return (
    <EventNotificationPreview
      type="ATTENDANCE_REGISTRATION_FROM_QUEUE"
      title="Du har fått plass på Ping med Bekk"
      shortDescription="Du er flyttet fra ventelisten og er nå påmeldt arrangementet."
    />
  )
}

export function AttendanceQueueUpdate() {
  return (
    <EventNotificationPreview
      type="ATTENDANCE_QUEUE_UPDATE"
      title="Ny plass på ventelisten til Ping med Bekk"
      shortDescription="Du er nå nummer 3 på ventelisten. Vi varsler deg hvis du får plass."
    />
  )
}

export function AttendanceCompletionFailed() {
  return (
    <EventNotificationPreview
      type="ATTENDANCE_COMPLETION_FAILED"
      title="Påmeldingen til Ping med Bekk ble ikke fullført"
      shortDescription="Fristen for å fullføre påmeldingen har gått ut, og du har mistet plassen din."
    />
  )
}

export function NewEvent() {
  return (
    <EventNotificationPreview
      type="NEW_EVENT"
      title="Nytt arrangement: Ping med Bekk"
      shortDescription="Et nytt arrangement er publisert. Se informasjon og påmeldingsfrister."
    />
  )
}

export function JobListingReminder() {
  return (
    <NotificationTypeRow
      label={getNotificationTypeLabel("JOB_LISTING_REMINDER")}
      notification={createNotification({
        title: "Søknadsfristen hos Bekk nærmer seg",
        shortDescription: "Husk å sende søknaden din før fristen går ut.",
        type: "JOB_LISTING_REMINDER",
        actorGroup: null,
      })}
      renderPayload={() => <NotificationJobListingPayload jobListing={jobListing} />}
    />
  )
}

export function NewInterestGroupEvent() {
  return (
    <NotificationTypeRow
      label={getNotificationTypeLabel("NEW_INTEREST_GROUP_EVENT")}
      notification={createNotification({
        title: "Nytt arrangement: Surfetur til Stadlandet",
        shortDescription: "X-Sport har publisert et nytt arrangement.",
        type: "NEW_INTEREST_GROUP_EVENT",
        actorGroup: {
          abbreviation: "X-Sport",
          name: "X-Sport",
          preferredDisplayName: "NAME",
        },
      })}
      renderPayload={() => <NotificationInterestGroupEventPayload interestGroupEvent={interestGroupEvent} />}
    />
  )
}

export function NewInterestGroupEventRequest() {
  return (
    <NotificationTypeRow
      label={getNotificationTypeLabel("NEW_INTEREST_GROUP_EVENT_REQUEST")}
      notification={createNotification({
        title: "Ny søknad: Surfetur til Stadlandet",
        shortDescription: "X-Sport har søkt om å arrangere et arrangement.",
        type: "NEW_INTEREST_GROUP_EVENT_REQUEST",
        actorGroup: {
          abbreviation: "X-Sport",
          name: "X-Sport",
          preferredDisplayName: "NAME",
        },
      })}
      renderPayload={() => (
        <NotificationUrlPayload url="https://online.ntnu.no/admin/interessegrupper/interest-group-event-surf" />
      )}
    />
  )
}

export function InterestGroupEventRequestReviewed() {
  return (
    <NotificationTypeRow
      label={getNotificationTypeLabel("INTEREST_GROUP_EVENT_REQUEST_REVIEWED")}
      notification={createNotification({
        title: "Søknaden din er godkjent: Surfetur til Stadlandet",
        shortDescription: "«Surfetur til Stadlandet» er publisert og synlig for medlemmer.",
        type: "INTEREST_GROUP_EVENT_REQUEST_REVIEWED",
      })}
      renderPayload={() => <NotificationUrlPayload url="https://online.ntnu.no/interessegrupper/grupper/x-sport" />}
    />
  )
}

export function NewFeedbackForm() {
  return (
    <NotificationTypeRow
      label={getNotificationTypeLabel("NEW_FEEDBACK_FORM")}
      notification={createNotification({
        title: "Hva syntes du om Ping med Bekk?",
        shortDescription: "Gi oss en tilbakemelding på arrangementet før svarfristen går ut.",
        type: "NEW_FEEDBACK_FORM",
        actorGroup: null,
      })}
      renderPayload={() => <NotificationUrlPayload url={`https://online.ntnu.no/tilbakemelding/${event.id}`} />}
    />
  )
}

export function AccentColors() {
  return (
    <div className="flex flex-col gap-6">
      {NotificationTypeSchema.options.map((notificationType) => (
        <NotificationTypeRow
          key={notificationType}
          label={getNotificationTypeLabel(notificationType)}
          notification={createNotification({
            type: notificationType,
            title: getNotificationTypeLabel(notificationType),
            shortDescription: "Dette er en eksempelvarsling med innhold som går over flere linjer i listen.",
          })}
        />
      ))}
    </div>
  )
}

export function NarrowLayout() {
  const [readAt, setReadAt] = useState<Date | null>(null)

  return (
    <div className="w-64 max-w-full">
      <NotificationItem
        notification={createNotification({
          title: "Påmelding fra ventelisten til et arrangement med en veldig lang tittel",
          shortDescription:
            "Arrangementet har fått en oppdatering: https://online.ntnu.no/en-veldig-lang-lenke-uten-mellomrom",
          type: "ATTENDANCE_REGISTRATION_FROM_QUEUE",
          actorGroup: {
            abbreviation: "Dotkom",
            name: "Drifts- og utviklingskomiteen med et veldig langt navn",
            preferredDisplayName: "NAME",
          },
        })}
        readAt={readAt}
        onMarkAsRead={() => {
          setReadAt(new Date())
        }}
      >
        <NotificationEventPayload event={event} attendance={attendance} />
      </NotificationItem>
    </div>
  )
}

export function Url() {
  return (
    <NotificationTypeRow
      label="URL"
      notification={createNotification({
        title: "Nye prikkeregler",
        shortDescription: "Online har oppdatert prikkereglene. Les hele regelverket på wiki.",
      })}
      renderPayload={() => <NotificationUrlPayload url="https://wiki.online.ntnu.no/prikkeregler" />}
    />
  )
}

export function Event() {
  return (
    <NotificationTypeRow
      label="Event"
      notification={createNotification({
        title: "Oppdatert: Ping med Bekk",
        shortDescription: "Arrangementet har flyttet seg fra Trondheim Spektrum til Huset.",
        type: "EVENT_UPDATE",
      })}
      renderPayload={() => <NotificationEventPayload event={event} attendance={attendance} />}
    />
  )
}

export function ArticlePayload() {
  return (
    <NotificationTypeRow
      label="Article"
      notification={createNotification({
        title: "Ny artikkel: Online kjøper Scandic Lerkendal",
        shortDescription: "En ny artikkel har blitt publisert på nettsiden.",
        type: "NEW_ARTICLE",
      })}
      renderPayload={() => <NotificationArticlePayload article={article} />}
    />
  )
}

export function OfflinePayload() {
  return (
    <NotificationTypeRow
      label="Offline"
      notification={createNotification({
        title: "Ny Offline-utgave #67",
        shortDescription: "Den nyeste utgaven av Offline er publisert.",
        type: "NEW_OFFLINE",
        actorGroup: {
          abbreviation: "Prokom",
          name: "Profil- og aviskomiteen",
          preferredDisplayName: "ABBREVIATION",
        },
      })}
      renderPayload={() => <NotificationOfflinePayload offline={offline} />}
    />
  )
}

export function GroupPayload() {
  return (
    <NotificationTypeRow
      label="Group"
      notification={createNotification({
        title: "Ny interessegruppe",
        shortDescription: "Dotkom har fått en ny gruppeside.",
        type: "NEW_INTEREST_GROUP",
        actorGroup: group,
      })}
      renderPayload={() => <NotificationGroupPayload group={group} />}
    />
  )
}

export function User() {
  return (
    <NotificationTypeRow
      label="User"
      notification={createNotification({
        title: "Du har fått en ny prikk",
        shortDescription: "En prikk ble registrert av Hans Hansen.",
        type: "NEW_MARK",
      })}
      renderPayload={() => <NotificationUserPayload user={attendee.user} userGrade={attendee.userGrade} />}
    />
  )
}

export function JobListingPayload() {
  return (
    <NotificationTypeRow
      label="Job listing"
      notification={createNotification({
        title: "Ny stillingsutlysning fra Bekk",
        shortDescription: "Bekk søker studenter til sommerjobb.",
        type: "NEW_JOB_LISTING",
      })}
      renderPayload={() => <NotificationJobListingPayload jobListing={jobListing} />}
    />
  )
}

export function AllPayloads() {
  return (
    <div className="flex flex-col gap-8">
      <Broadcast />
      <BroadcastImportant />
      <Url />
      <Event />
      <EventReminder />
      <AttendanceRegistration />
      <AttendanceDeregistration />
      <AttendanceRegisteredFromQueue />
      <AttendanceQueueUpdate />
      <AttendanceCompletionFailed />
      <NewEvent />
      <ArticlePayload />
      <OfflinePayload />
      <GroupPayload />
      <User />
      <JobListingPayload />
      <JobListingReminder />
      <NewFeedbackForm />
      <NewInterestGroupEvent />
      <NewInterestGroupEventRequest />
      <InterestGroupEventRequestReviewed />
    </div>
  )
}
