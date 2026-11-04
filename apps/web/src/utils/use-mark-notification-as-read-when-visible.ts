"use client"

import { getNotificationTypeConfiguration, type NotificationType } from "@dotkomonline/rpc/notification"
import { useEffect, useRef } from "react"

const MINIMUM_VISIBLE_RATIO_TO_MARK_AS_READ = 0.5

export function useMarkNotificationAsReadWhenVisible<Element extends HTMLElement>({
  notificationId,
  notificationType,
  readAt,
  onMarkAsRead,
}: {
  notificationId?: string
  notificationType?: NotificationType
  readAt?: Date | null
  onMarkAsRead?: () => void
}) {
  const elementReference = useRef<Element>(null)
  const markAsReadReference = useRef(onMarkAsRead)
  const behavior =
    notificationType === undefined ? undefined : getNotificationTypeConfiguration(notificationType).behavior
  const canAutomaticallyMarkAsRead = readAt === null && behavior === "DEFAULT" && onMarkAsRead !== undefined

  useEffect(() => {
    markAsReadReference.current = onMarkAsRead
  }, [onMarkAsRead])

  useEffect(() => {
    const element = elementReference.current

    if (!canAutomaticallyMarkAsRead || element === null || notificationId === undefined) {
      return
    }

    let isVisible = false
    let hasMarkedAsRead = false

    const markAsReadIfVisible = () => {
      if (!isVisible || hasMarkedAsRead || document.visibilityState !== "visible") {
        return
      }

      hasMarkedAsRead = true
      markAsReadReference.current?.()
      intersectionObserver.disconnect()
    }

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry?.isIntersecting === true && entry.intersectionRatio >= MINIMUM_VISIBLE_RATIO_TO_MARK_AS_READ

        markAsReadIfVisible()
      },
      {
        threshold: MINIMUM_VISIBLE_RATIO_TO_MARK_AS_READ,
      }
    )

    intersectionObserver.observe(element)
    document.addEventListener("visibilitychange", markAsReadIfVisible)

    return () => {
      intersectionObserver.disconnect()
      document.removeEventListener("visibilitychange", markAsReadIfVisible)
    }
  }, [canAutomaticallyMarkAsRead, notificationId])

  return elementReference
}
