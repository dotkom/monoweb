import type { Article } from "@dotkomonline/rpc/article"
import type { Group } from "@dotkomonline/rpc/group"
import type { JobListing } from "@dotkomonline/rpc/job-listing"
import type { Offline } from "@dotkomonline/rpc/offline"
import { Text } from "@dotkomonline/ui"
import { subHours } from "date-fns"
import type { ReactNode } from "react"
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
  NotificationJobListingPayload,
  NotificationOfflinePayload,
  NotificationTextPayload,
  NotificationUrlPayload,
  NotificationUserPayload,
} from "./NotificationPayloads"

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

const viewer = createMockUser({
  id: "viewer",
  username: "viewer",
  name: "Kari Nordmann",
})
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
          <NotificationItem notification={notification} readAt={null}>
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
  return (
    <NotificationTypeRow
      label="Broadcast"
      notification={createNotification()}
      renderPayload={() => (
        <NotificationTextPayload content="Les mer om hvilke regler som gjelder, hvordan prikkene registreres og hvordan du kan klage dersom noe har blitt feil." />
      )}
    />
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
      renderPayload={() => (
        <NotificationUserPayload user={attendee.user} viewerId={viewer.id} userGrade={attendee.userGrade} />
      )}
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
      <Url />
      <Event />
      <ArticlePayload />
      <OfflinePayload />
      <GroupPayload />
      <User />
      <JobListingPayload />
    </div>
  )
}
