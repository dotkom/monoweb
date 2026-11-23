"use client"

import { useEffect, useRef } from "react"

const MINIMUM_VISIBLE_RATIO_TO_MARK_AS_READ = 0.5

export function useMarkNotificationAsReadWhenVisible<Element extends HTMLElement>({
  notificationId,
  readAt,
  onMarkAsRead,
}: {
  notificationId?: string
  readAt?: Date | null
  onMarkAsRead?: () => void
}) {
  const elementReference = useRef<Element>(null)
  const markAsReadReference = useRef(onMarkAsRead)
  const canAutomaticallyMarkAsRead = readAt === null && onMarkAsRead !== undefined

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
