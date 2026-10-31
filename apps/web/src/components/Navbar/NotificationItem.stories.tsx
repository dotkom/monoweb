import type { Article } from "@dotkomonline/rpc/article"
import type { Group } from "@dotkomonline/rpc/group"
import type { JobListing } from "@dotkomonline/rpc/job-listing"
import { getNotificationTypeLabel, NotificationTypeSchema } from "@dotkomonline/rpc/notification"
import type { Offline } from "@dotkomonline/rpc/offline"
import { Button, Title } from "@dotkomonline/ui"
import { IconChecks } from "@tabler/icons-react"
import { subHours } from "date-fns"
import { type MouseEvent, type ReactNode, useState } from "react"
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
    link: { type: "NONE" },
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

type NotificationExample = {
  notification: NotificationItemNotification
  renderPayload?: () => ReactNode
}

const notificationExamples: NotificationExample[] = [
  {
    notification: createNotification({
      id: "notification-important",
      type: "BROADCAST_IMPORTANT",
      title: "Viktig informasjon fra Hovedstyret",
      shortDescription: "Les informasjonen og bekreft at du har sett varslingen.",
    }),
  },
  {
    notification: createNotification({
      id: "notification-important-long-content",
      type: "BROADCAST_IMPORTANT",
      title:
        "Viktig informasjon fra Hovedstyret til alle medlemmer om omfattende endringer i påmeldingsregler, betalingsfrister, prikkeregler og praktisk gjennomføring av kommende arrangementer, generalforsamlingen og sosiale aktiviteter resten av semesteret som du må lese og bekrefte at du har fått med deg før de nye reglene trer i kraft",
      shortDescription:
        "Vi ber alle medlemmer om å lese gjennom hele denne meldingen før de melder seg på nye arrangementer. Endringene gjelder både reservasjon av plass, frister for betaling, avmelding ved sykdom og hvordan du kontakter arrangøren dersom du trenger tilrettelegging. Reglene gjelder også dersom du allerede står på venteliste eller har fått bekreftet en plass. Ta kontakt med Hovedstyret hvis noe er uklart, og merk varslingen som lest når du har satt deg inn i informasjonen og vet hva endringene betyr for deg.",
    }),
  },
  {
    notification: createNotification({
      id: "notification-feedback",
      link: { type: "URL", url: `https://online.ntnu.no/tilbakemelding/${event.id}` },
      type: "NEW_FEEDBACK_FORM",
      title: "Hva syntes du om Ping med Bekk?",
      shortDescription: "Gi oss en tilbakemelding på arrangementet før svarfristen går ut.",
      actorGroup: null,
    }),
    renderPayload: () => <NotificationUrlPayload url={`https://online.ntnu.no/tilbakemelding/${event.id}`} />,
  },
  {
    notification: createNotification({
      id: "notification-broadcast",
    }),
  },
  {
    notification: createNotification({
      id: "notification-url",
      link: { type: "URL", url: "https://wiki.online.ntnu.no/prikkeregler" },
      title: "Nye prikkeregler",
      shortDescription: "Online har oppdatert prikkereglene. Les hele regelverket på wiki.",
    }),
    renderPayload: () => <NotificationUrlPayload url="https://wiki.online.ntnu.no/prikkeregler" />,
  },
  {
    notification: createNotification({
      id: "notification-event",
      link: { type: "EVENT", eventId: event.id },
      type: "EVENT_UPDATE",
      title: "Oppdatert: Ping med Bekk",
      shortDescription: "Arrangementet har flyttet seg fra Trondheim Spektrum til Huset.",
      actorGroup: null,
    }),
    renderPayload: () => <NotificationEventPayload event={event} attendance={attendance} />,
  },
  {
    notification: createNotification({
      id: "notification-article",
      link: { type: "ARTICLE", articleSlug: article.slug },
      type: "NEW_ARTICLE",
      title: "Ny artikkel: Online kjøper Scandic Lerkendal",
      shortDescription: "En ny artikkel har blitt publisert på nettsiden.",
    }),
    renderPayload: () => <NotificationArticlePayload article={article} />,
  },
  {
    notification: createNotification({
      id: "notification-offline",
      link: { type: "OFFLINE", offlineId: "offline-67" },
      type: "NEW_OFFLINE",
      title: "Ny Offline-utgave #67",
      shortDescription: "Den nyeste utgaven av Offline er publisert.",
      actorGroup: {
        abbreviation: "Prokom",
        name: "Profil- og aviskomiteen",
        preferredDisplayName: "ABBREVIATION",
      },
    }),
    renderPayload: () => <NotificationOfflinePayload offline={offline} />,
  },
  {
    notification: createNotification({
      id: "notification-group",
      link: { type: "GROUP", groupSlug: group.slug },
      type: "NEW_INTEREST_GROUP",
      title: "Ny interessegruppe",
      shortDescription: "Dotkom har fått en ny gruppeside.",
      actorGroup: group,
    }),
    renderPayload: () => <NotificationGroupPayload group={group} />,
  },
  {
    notification: createNotification({
      id: "notification-user",
      link: { type: "USER", userId: attendee.user.id },
      type: "NEW_MARK",
      title: "Du har fått en ny prikk",
      shortDescription: "En prikk ble registrert av Hans Hansen.",
    }),
    renderPayload: () => <NotificationUserPayload user={attendee.user} userGrade={attendee.userGrade} />,
  },
  {
    notification: createNotification({
      id: "notification-job-listing",
      link: { type: "JOB_LISTING", jobListingId: jobListing.id },
      type: "NEW_JOB_LISTING",
      title: "Ny stillingsutlysning fra Bekk",
      shortDescription: "Bekk søker studenter til sommerjobb.",
      actorGroup: null,
    }),
    renderPayload: () => <NotificationJobListingPayload jobListing={jobListing} />,
  },
  {
    notification: createNotification({
      id: "notification-long-content",
      link: { type: "EVENT", eventId: event.id },
      type: "ATTENDANCE_REGISTRATION_FROM_QUEUE",
      title: "Påmelding fra køen til et arrangement med en veldig lang tittel",
      shortDescription:
        "Arrangementet har fått en oppdatering: https://online.ntnu.no/en-veldig-lang-lenke-uten-mellomrom",
      actorGroup: {
        abbreviation: "Dotkom",
        name: "Drifts- og utviklingskomiteen med et veldig langt navn",
        preferredDisplayName: "NAME",
      },
    }),
    renderPayload: () => <NotificationEventPayload event={event} attendance={attendance} />,
  },
]

function DropdownPreviewContent({ height }: { height: number }) {
  const [readAtByNotificationId, setReadAtByNotificationId] = useState<Record<string, Date>>({})
  const hasUnreadNotifications = notificationExamples.some(({ notification }) => {
    return readAtByNotificationId[notification.id] === undefined
  })

  const markAllAsRead = () => {
    const readAt = new Date()

    setReadAtByNotificationId((previousReadAtByNotificationId) => {
      const updatedReadAtByNotificationId = { ...previousReadAtByNotificationId }

      for (const { notification } of notificationExamples) {
        updatedReadAtByNotificationId[notification.id] ??= readAt
      }

      return updatedReadAtByNotificationId
    })
  }

  return (
    <div
      style={{ height }}
      className="flex w-full max-h-[calc(100dvh-6rem)] flex-col overflow-hidden rounded-3xl border border-gray-300/70 bg-white shadow-md dark:border-stone-700 dark:bg-stone-900"
    >
      <div className="flex shrink-0 items-center justify-between gap-2 px-4 pt-4">
        <Title size="md" className="font-semibold text-gray-900 dark:text-white">
          Varslinger
        </Title>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Merk alle som lest"
          disabled={!hasUnreadNotifications}
          onClick={markAllAsRead}
          icon={<IconChecks className="size-4.5" />}
        />
      </div>

      <div className="mt-3 min-h-0 flex-1 space-y-5 overflow-x-hidden overflow-y-auto overscroll-contain px-4 pb-4">
        {notificationExamples.map(({ notification, renderPayload }) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            readAt={readAtByNotificationId[notification.id] ?? null}
            onMarkAsRead={() => {
              setReadAtByNotificationId((previousReadAtByNotificationId) => ({
                ...previousReadAtByNotificationId,
                [notification.id]: new Date(),
              }))
            }}
            className="last-of-type:-mb-2"
          >
            {renderPayload?.()}
          </NotificationItem>
        ))}
      </div>

      <div className="shrink-0 border-t border-gray-200 px-2 pb-2 pt-1.5 dark:border-stone-700">
        <Button
          element="a"
          href="/varslinger"
          variant="ghost"
          className="h-8 w-full rounded-b-xl rounded-t-xs"
          onClick={(clickEvent: MouseEvent<HTMLAnchorElement>) => clickEvent.preventDefault()}
        >
          Se alle varslinger
        </Button>
      </div>
    </div>
  )
}

function DropdownPreview({ height = 544 }: { height?: number }) {
  const [previewVersion, setPreviewVersion] = useState(0)

  return (
    <div className="-m-2 flex max-w-96 flex-col gap-4">
      <DropdownPreviewContent key={previewVersion} height={height} />
      <Button
        variant="outline"
        className="w-fit"
        onClick={() => setPreviewVersion((previousPreviewVersion) => previousPreviewVersion + 1)}
      >
        Tilbakestill varslinger
      </Button>
    </div>
  )
}

export function Default() {
  return (
    <div className="max-w-96">
      <NotificationItem notification={createNotification()} readAt={null} />
    </div>
  )
}

export function AccentColors() {
  return (
    <div className="flex max-w-96 flex-col gap-5">
      {NotificationTypeSchema.options.map((notificationType) => (
        <NotificationItem
          key={notificationType}
          notification={createNotification({
            id: `notification-${notificationType}`,
            type: notificationType,
            title: getNotificationTypeLabel(notificationType),
            shortDescription: "Dette er en eksempelvarsling med innhold som går over flere linjer i listen.",
          })}
          readAt={null}
        />
      ))}
    </div>
  )
}

export function AllPayloads() {
  const [readAtByNotificationId, setReadAtByNotificationId] = useState<Record<string, Date>>({})

  return (
    <div className="flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Title size="lg">Alle varslinger og innholdstyper</Title>
        <Button variant="outline" onClick={() => setReadAtByNotificationId({})}>
          Tilbakestill varslinger
        </Button>
      </div>

      <div className="grid w-full grid-cols-1 items-start gap-6 md:grid-cols-2">
        {notificationExamples.map(({ notification, renderPayload }) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            readAt={readAtByNotificationId[notification.id] ?? null}
            onMarkAsRead={() => {
              setReadAtByNotificationId((previousReadAtByNotificationId) => ({
                ...previousReadAtByNotificationId,
                [notification.id]: new Date(),
              }))
            }}
          >
            {renderPayload?.()}
          </NotificationItem>
        ))}
      </div>
    </div>
  )
}

export function Dropdown() {
  return <DropdownPreview />
}

export function MobileDropdown() {
  return <DropdownPreview height={523} />
}
MobileDropdown.meta = { iframed: true, width: 375 }

export function SmallMobileDropdown() {
  return <DropdownPreview height={424} />
}
SmallMobileDropdown.meta = { iframed: true, width: 320 }
