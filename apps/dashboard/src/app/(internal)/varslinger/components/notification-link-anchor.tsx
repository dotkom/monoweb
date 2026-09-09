"use client"

import type { NotificationLink } from "@dotkomonline/rpc/notification"
import { getNotificationLinkTypeLabel } from "@dotkomonline/rpc/notification"
import { Anchor, Text } from "@mantine/core"
import Link from "next/link"

export function getNotificationLinkHref(link: NotificationLink): string | null {
  if (link.type === "NONE") {
    return null
  }

  if (link.type === "URL") {
    return link.url
  }

  if (link.type === "EVENT") {
    return `/arrangementer/${link.eventId}`
  }

  if (link.type === "GROUP") {
    return `/grupper/${link.groupSlug}`
  }

  if (link.type === "USER") {
    return `/brukere/${link.userId}`
  }

  if (link.type === "JOB_LISTING") {
    return `/karriere/${link.jobListingId}`
  }

  if (link.type === "OFFLINE") {
    return "/offline"
  }

  return null
}

export function NotificationLinkAnchor({ link }: { link: NotificationLink }) {
  const label = getNotificationLinkTypeLabel(link.type)
  const href = getNotificationLinkHref(link)

  if (href === null) {
    return (
      <Text size="sm" c="dimmed">
        {label}
      </Text>
    )
  }

  const isExternal = link.type === "URL"

  if (isExternal) {
    return (
      <Anchor href={href} size="sm" target="_blank" rel="noreferrer">
        {label}
      </Anchor>
    )
  }

  return (
    <Anchor component={Link} href={href} size="sm">
      {label}
    </Anchor>
  )
}
