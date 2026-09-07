"use client"

import { GroupLogoAvatar } from "@/components/atoms/GroupLogo"
import { EventListItem } from "@/components/molecules/EventListItem/EventListItem"
import {
  getAttendeeIcons,
  getAttendeePlate,
} from "@/app/arrangementer/components/AttendanceCard/AttendeeList/AttendeePlate"
import { useTRPC } from "@/utils/trpc/client"
import type { Article } from "@dotkomonline/rpc/article"
import type { Attendance, AttendanceSummary } from "@dotkomonline/rpc/attendance"
import type { Event, EventSummary } from "@dotkomonline/rpc/event"
import type { Group } from "@dotkomonline/rpc/group"
import { getGroupDisplayName } from "@dotkomonline/rpc/group"
import type { JobListing } from "@dotkomonline/rpc/job-listing"
import type { Notification } from "@dotkomonline/rpc/notification"
import type { Offline } from "@dotkomonline/rpc/offline"
import type { User } from "@dotkomonline/rpc/user"
import { AvatarFallback, cn, Text } from "@dotkomonline/ui"
import { richTextToPlainText } from "@dotkomonline/utils"
import { IconArrowUpRight, IconBriefcase, IconQuestionMark } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import Image from "next/image"
import Link from "next/link"

const payloadCardClassName =
  "flex min-w-0 items-center gap-3 rounded-lg border border-gray-200 p-2 transition-colors bg-white/75 hover:bg-white hover:border-muted-foreground dark:border-white/8 dark:bg-white/8 dark:hover:bg-white/15"

function PayloadSkeleton() {
  return <div className="h-20 animate-pulse rounded-xl bg-gray-200 dark:bg-stone-700" />
}

function UnavailablePayload() {
  return <Text className="text-xs text-muted-foreground">Innholdet er ikke lenger tilgjengelig.</Text>
}

export function NotificationPayload({ notification }: { notification: Notification }) {
  switch (notification.link.type) {
    case "NONE":
      return null
    case "URL":
      return <NotificationUrlPayload url={notification.link.url} />
    case "EVENT":
      return <EventPayload eventId={notification.link.eventId} />
    case "ARTICLE":
      return <ArticlePayload articleSlug={notification.link.articleSlug} />
    case "GROUP":
      return <GroupPayload groupSlug={notification.link.groupSlug} />
    case "USER":
      return <UserPayload userId={notification.link.userId} />
    case "OFFLINE":
      return <OfflinePayload offlineId={notification.link.offlineId} />
    case "JOB_LISTING":
      return <JobListingPayload jobListingId={notification.link.jobListingId} />
  }
}

function EventPayload({ eventId }: { eventId: string }) {
  const trpcClient = useTRPC()
  const query = useQuery(trpcClient.event.find.queryOptions(eventId))

  if (query.isPending) {
    return <PayloadSkeleton />
  }

  if (query.isError || query.data === null) {
    return <UnavailablePayload />
  }

  return <NotificationEventPayload event={query.data.event} attendance={query.data.attendance} />
}

function ArticlePayload({ articleSlug }: { articleSlug: string }) {
  const trpcClient = useTRPC()
  const query = useQuery(trpcClient.article.findBySlug.queryOptions(articleSlug))

  if (query.isPending) {
    return <PayloadSkeleton />
  }

  if (query.isError || query.data === null) {
    return <UnavailablePayload />
  }

  return <NotificationArticlePayload article={query.data} />
}

function GroupPayload({ groupSlug }: { groupSlug: string }) {
  const trpcClient = useTRPC()
  const query = useQuery(trpcClient.group.find.queryOptions(groupSlug))

  if (query.isPending) {
    return <PayloadSkeleton />
  }

  if (query.isError || query.data === null) {
    return <UnavailablePayload />
  }

  return <NotificationGroupPayload group={query.data} />
}

function UserPayload({ userId }: { userId: string }) {
  const trpcClient = useTRPC()
  const query = useQuery(trpcClient.user.get.queryOptions(userId))

  if (query.isPending) {
    return <PayloadSkeleton />
  }

  if (query.isError) {
    return <UnavailablePayload />
  }

  return <NotificationUserPayload user={query.data} />
}

function OfflinePayload({ offlineId }: { offlineId: string }) {
  const trpcClient = useTRPC()
  const query = useQuery(trpcClient.offline.find.queryOptions(offlineId))

  if (query.isPending) {
    return <PayloadSkeleton />
  }

  if (query.isError || query.data === null) {
    return <UnavailablePayload />
  }

  return <NotificationOfflinePayload offline={query.data} />
}

function JobListingPayload({ jobListingId }: { jobListingId: string }) {
  const trpcClient = useTRPC()
  const query = useQuery(trpcClient.jobListing.get.queryOptions(jobListingId))

  if (query.isPending) {
    return <PayloadSkeleton />
  }

  if (query.isError) {
    return <UnavailablePayload />
  }

  return <NotificationJobListingPayload jobListing={query.data} />
}

export function NotificationUrlPayload({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex min-w-0 items-center gap-2 rounded-lg border border-gray-200 p-2 transition-colors bg-white/75 hover:bg-white hover:border-muted-foreground dark:border-white/8 dark:bg-white/8 dark:hover:bg-white/15"
    >
      <Text className="min-w-0 flex-1 truncate text-sm">{url}</Text>
      <IconArrowUpRight aria-hidden className="size-4 shrink-0" />
    </a>
  )
}

export function NotificationEventPayload({
  event,
  attendance,
  userId,
}: {
  event: Event | EventSummary
  attendance: Attendance | AttendanceSummary | null
  userId?: string | null
}) {
  return (
    <div className={cn(payloadCardClassName, "p-0")}>
      <EventListItem
        event={event}
        attendance={attendance}
        userId={userId}
        compact
        className="mx-0 w-full min-w-0 last:mb-0 rounded-lg"
      />
    </div>
  )
}

export function NotificationArticlePayload({
  article,
}: {
  article: Pick<Article, "id" | "imageUrl" | "slug" | "tags" | "title">
}) {
  return (
    <Link href={`/artikler/${article.slug}/${article.id}`} className={payloadCardClassName}>
      <div className="relative h-16 w-auto aspect-video shrink-0 overflow-hidden rounded-sm bg-gray-200 dark:bg-stone-700">
        <Image src={article.imageUrl} alt="" fill sizes="64px" className="object-cover" />
      </div>

      <div className="min-w-0 flex-1 overflow-hidden py-1">
        <Text className="text-sm font-medium truncate">{article.title}</Text>

        <div className="mt-2 flex gap-1.5 overflow-hidden">
          {article.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.name}
              className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[0.625rem] text-muted-foreground dark:bg-white/8"
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}

export function NotificationOfflinePayload({ offline }: { offline: Pick<Offline, "fileUrl" | "imageUrl" | "title"> }) {
  const href = offline.fileUrl ?? "/offline"

  return (
    <Link href={href} className={payloadCardClassName}>
      <div className="relative h-16 w-auto aspect-[0.777] shrink-0 overflow-hidden rounded-sm bg-gray-200 dark:bg-stone-700">
        {offline.imageUrl !== null && (
          <Image src={offline.imageUrl} alt="" fill sizes="64px" className="object-cover" />
        )}
      </div>

      <Text className="line-clamp-2 text-sm font-medium">{offline.title}</Text>
    </Link>
  )
}

export function NotificationGroupPayload({
  group,
}: {
  group: Pick<Group, "abbreviation" | "description" | "imageUrl" | "name" | "preferredDisplayName" | "slug">
}) {
  const displayName = getGroupDisplayName(group)
  const description = richTextToPlainText(group.description)

  return (
    <Link href={`/grupper/${group.slug}`} className={payloadCardClassName}>
      <GroupLogoAvatar
        src={group.imageUrl}
        alt={displayName}
        className="size-12 shrink-0 p-0.5"
        fallback={
          <AvatarFallback className="bg-gray-200 dark:bg-stone-700">
            <IconQuestionMark className="size-6" />
          </AvatarFallback>
        }
      />

      <div className="min-w-0 flex flex-col gap-0.5">
        <Text className="truncate text-sm font-medium">{displayName}</Text>
        <Text className="text-xs text-muted-foreground line-clamp-2">{description}</Text>
      </div>
    </Link>
  )
}

export function NotificationUserPayload({ user, userGrade = null }: { user: User; userGrade?: number | null }) {
  const AttendeePlate = getAttendeePlate(user)
  const { smallIcons, largeIcon } = getAttendeeIcons(user)

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-full border border-gray-200 p-2 transition-colors bg-white/75 hover:bg-white hover:border-muted-foreground dark:border-white/8 dark:bg-white/8 dark:hover:bg-white/15">
      <AttendeePlate
        attendee={{ userGrade, userId: user.id }}
        smallIcons={smallIcons}
        largeIcon={largeIcon}
        user={{
          id: user.id,
          username: user.username,
          name: user.name,
          imageUrl: user.imageUrl,
          flags: user.flags,
          memberships: user.memberships,
        }}
      />
    </div>
  )
}

export function NotificationJobListingPayload({
  jobListing,
}: {
  jobListing: Pick<JobListing, "company" | "id" | "title">
}) {
  return (
    <Link href={`/karriere/${jobListing.id}`} className={payloadCardClassName}>
      <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-white">
        {jobListing.company.imageUrl === null && <IconBriefcase aria-hidden className="size-6 text-gray-500" />}

        {jobListing.company.imageUrl !== null && (
          <Image src={jobListing.company.imageUrl} alt="" fill sizes="64px" className="object-contain" />
        )}
      </div>

      <div className="min-w-0">
        <Text className="line-clamp-2 text-sm font-medium">{jobListing.title}</Text>
        <Text className="mt-0.5 truncate text-xs text-gray-600 dark:text-stone-400">{jobListing.company.name}</Text>
      </div>
    </Link>
  )
}
