"use client"

import { useTRPC } from "@/utils/trpc/client"
import type { Notification } from "@dotkomonline/rpc/notification"
import { Text } from "@dotkomonline/ui"
import { useQuery } from "@tanstack/react-query"
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

type NotificationPayloadResolverProps = {
  notification: Notification
}

export function NotificationPayloadResolver({ notification }: NotificationPayloadResolverProps) {
  switch (notification.link.type) {
    case "NONE":
      return <NotificationTextPayload content={notification.content} />
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

function PayloadSkeleton() {
  return <div className="h-20 animate-pulse rounded-xl bg-gray-200 dark:bg-stone-700" />
}

function UnavailablePayload() {
  return <Text className="text-xs text-gray-500 dark:text-stone-400">Innholdet er ikke lenger tilgjengelig.</Text>
}

function EventPayload({ eventId }: { eventId: string }) {
  const trpcClient = useTRPC()
  const eventQuery = useQuery(trpcClient.event.find.queryOptions(eventId))

  if (eventQuery.isPending) {
    return <PayloadSkeleton />
  }

  if (eventQuery.isError || eventQuery.data === null) {
    return <UnavailablePayload />
  }

  return <NotificationEventPayload event={eventQuery.data.event} attendance={eventQuery.data.attendance} />
}

function ArticlePayload({ articleSlug }: { articleSlug: string }) {
  const trpcClient = useTRPC()
  const articleQuery = useQuery(trpcClient.article.findBySlug.queryOptions(articleSlug))

  if (articleQuery.isPending) {
    return <PayloadSkeleton />
  }

  if (articleQuery.isError || articleQuery.data === null) {
    return <UnavailablePayload />
  }

  return <NotificationArticlePayload article={articleQuery.data} />
}

function GroupPayload({ groupSlug }: { groupSlug: string }) {
  const trpcClient = useTRPC()
  const groupQuery = useQuery(trpcClient.group.find.queryOptions(groupSlug))

  if (groupQuery.isPending) {
    return <PayloadSkeleton />
  }

  if (groupQuery.isError || groupQuery.data === null) {
    return <UnavailablePayload />
  }

  return <NotificationGroupPayload group={groupQuery.data} />
}

function UserPayload({ userId }: { userId: string }) {
  const trpcClient = useTRPC()
  const userQuery = useQuery(trpcClient.user.get.queryOptions(userId))

  if (userQuery.isPending) {
    return <PayloadSkeleton />
  }

  if (userQuery.isError) {
    return <UnavailablePayload />
  }

  return <NotificationUserPayload user={userQuery.data} />
}

function OfflinePayload({ offlineId }: { offlineId: string }) {
  const trpcClient = useTRPC()
  const offlineQuery = useQuery(trpcClient.offline.find.queryOptions(offlineId))

  if (offlineQuery.isPending) {
    return <PayloadSkeleton />
  }

  if (offlineQuery.isError || offlineQuery.data === null) {
    return <UnavailablePayload />
  }

  return <NotificationOfflinePayload offline={offlineQuery.data} />
}

function JobListingPayload({ jobListingId }: { jobListingId: string }) {
  const trpcClient = useTRPC()
  const jobListingQuery = useQuery(trpcClient.jobListing.get.queryOptions(jobListingId))

  if (jobListingQuery.isPending) {
    return <PayloadSkeleton />
  }

  if (jobListingQuery.isError) {
    return <UnavailablePayload />
  }

  return <NotificationJobListingPayload jobListing={jobListingQuery.data} />
}
