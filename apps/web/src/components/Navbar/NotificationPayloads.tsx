"use client"

import { GroupLogoAvatar } from "@/components/atoms/GroupLogo"
import { EventListItem } from "@/components/molecules/EventListItem/EventListItem"
import {
  getAttendeeIcons,
  getAttendeePlate,
} from "@/app/arrangementer/components/AttendanceCard/AttendeeList/AttendeePlate"
import type { Article } from "@dotkomonline/rpc/article"
import type { Attendance, AttendanceSummary } from "@dotkomonline/rpc/attendance"
import type { Event, EventSummary } from "@dotkomonline/rpc/event"
import type { Group } from "@dotkomonline/rpc/group"
import { getGroupDisplayName } from "@dotkomonline/rpc/group"
import type { JobListing } from "@dotkomonline/rpc/job-listing"
import type { Offline } from "@dotkomonline/rpc/offline"
import type { User } from "@dotkomonline/rpc/user"
import { AvatarFallback, Button, Text, cn } from "@dotkomonline/ui"
import { IconArrowUpRight, IconBriefcase, IconQuestionMark } from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { richTextToPlainText } from "@dotkomonline/utils"

type NotificationTextPayloadProps = {
  content: string
}

export function NotificationTextPayload({ content }: NotificationTextPayloadProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const shouldShowToggle = content.length > 160
  let toggleLabel = "Les mer"

  if (isExpanded) {
    toggleLabel = "Vis mindre"
  }

  return (
    <div className="relative">
      <Text
        className={cn(
          "whitespace-pre-line text-sm leading-relaxed text-gray-700 dark:text-stone-300",
          !isExpanded && "line-clamp-3"
        )}
      >
        {content}
      </Text>
      {shouldShowToggle && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded((wasExpanded) => !wasExpanded)}
          className="mt-1 h-auto px-0 py-1 text-xs"
        >
          {toggleLabel}
        </Button>
      )}
    </div>
  )
}

type NotificationUrlPayloadProps = {
  url: string
}

export function NotificationUrlPayload({ url }: NotificationUrlPayloadProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex min-w-0 items-center gap-2 rounded-lg border border-gray-200 dark:border-white/8 p-2 transition-colors bg-white/75 hover:bg-white hover:border-muted-foreground dark:bg-white/8 dark:hover:bg-white/15"
    >
      <Text className="min-w-0 flex-1 truncate text-sm">{url}</Text>

      <IconArrowUpRight aria-hidden className="size-4 shrink-0" />
    </a>
  )
}

type NotificationEventPayloadProps = {
  event: Event | EventSummary
  attendance: Attendance | AttendanceSummary | null
  userId?: string | null
}

export function NotificationEventPayload({ event, attendance, userId }: NotificationEventPayloadProps) {
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-gray-300 bg-white/70 dark:border-stone-600 dark:bg-stone-800/70">
      <EventListItem
        event={event}
        attendance={attendance}
        userId={userId}
        compact
        className="mx-0 w-full min-w-0 last:mb-0 hover:bg-blue-50 dark:hover:bg-stone-700"
      />
    </div>
  )
}

type NotificationArticlePayloadProps = {
  article: Pick<Article, "id" | "imageUrl" | "slug" | "tags" | "title">
}

export function NotificationArticlePayload({ article }: NotificationArticlePayloadProps) {
  return (
    <Link
      href={`/artikler/${article.slug}/${article.id}`}
      className="flex min-w-0 items-center gap-3 rounded-lg border border-gray-200 dark:border-white/8 p-2 transition-colors bg-white/75 hover:bg-white hover:border-muted-foreground dark:bg-white/8 dark:hover:bg-white/15"
    >
      <div className="relative h-16 w-auto aspect-video shrink-0 overflow-hidden rounded-sm bg-gray-200 dark:bg-stone-700">
        <Image src={article.imageUrl} alt="" fill sizes="64px" className="object-cover" />
      </div>
      <div className="min-w-0 flex-1 overflow-hidden py-1">
        <Text className="text-sm font-medium truncate">{article.title}</Text>

        <div className="mt-2 flex gap-1.5 overflow-hidden">
          {article.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.name}
              className="shrink-0 rounded-full bg-gray-100 dark:bg-white/8 px-2 py-0.5 text-[0.625rem] text-muted-foreground"
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}

type NotificationOfflinePayloadProps = {
  offline: Pick<Offline, "fileUrl" | "imageUrl" | "title">
}

export function NotificationOfflinePayload({ offline }: NotificationOfflinePayloadProps) {
  let offlineUrl = "/offline"

  if (offline.fileUrl !== null) {
    offlineUrl = offline.fileUrl
  }

  return (
    <Link
      href={offlineUrl}
      className="flex min-w-0 items-center gap-3 rounded-lg border border-gray-200 dark:border-white/8 p-2 transition-colors bg-white/75 hover:bg-white hover:border-muted-foreground dark:bg-white/8 dark:hover:bg-white/15"
    >
      <div className="relative h-16 w-auto aspect-[0.777] shrink-0 overflow-hidden rounded-sm bg-gray-200 dark:bg-stone-700">
        {offline.imageUrl !== null && (
          <Image src={offline.imageUrl} alt="" fill sizes="64px" className="object-cover" />
        )}
      </div>

      <Text className="line-clamp-2 text-sm font-medium">{offline.title}</Text>
    </Link>
  )
}

type NotificationGroupPayloadProps = {
  group: Pick<Group, "abbreviation" | "description" | "imageUrl" | "name" | "preferredDisplayName" | "slug">
}

export function NotificationGroupPayload({ group }: NotificationGroupPayloadProps) {
  const displayName = getGroupDisplayName(group)
  const description = richTextToPlainText(group.description)

  return (
    <Link
      href={`/grupper/${group.slug}`}
      className="flex min-w-0 items-center gap-3 rounded-lg border border-gray-200 dark:border-white/8 p-2 transition-colors bg-white/75 hover:bg-white hover:border-muted-foreground dark:bg-white/8 dark:hover:bg-white/15"
    >
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

type NotificationUserPayloadProps = {
  user: User
  viewerId?: string
  userGrade?: number | null
}

export function NotificationUserPayload({ user, userGrade = null }: NotificationUserPayloadProps) {
  const attendee = {
    userGrade,
    userId: user.id,
  }
  const AttendeePlate = getAttendeePlate(user)
  const { smallIcons, largeIcon } = getAttendeeIcons(user)

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-full border border-gray-200 dark:border-white/8 p-2 transition-colors bg-white/75 hover:bg-white hover:border-muted-foreground dark:bg-white/8 dark:hover:bg-white/15">
      <AttendeePlate
        attendee={attendee}
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

type NotificationJobListingPayloadProps = {
  jobListing: Pick<JobListing, "company" | "id" | "title">
}

export function NotificationJobListingPayload({ jobListing }: NotificationJobListingPayloadProps) {
  return (
    <Link
      href={`/karriere/${jobListing.id}`}
      className="flex min-w-0 items-center gap-3 rounded-lg border border-gray-200 dark:border-white/8 p-2 transition-colors bg-white/75 hover:bg-white hover:border-muted-foreground dark:bg-white/8 dark:hover:bg-white/15"
    >
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
