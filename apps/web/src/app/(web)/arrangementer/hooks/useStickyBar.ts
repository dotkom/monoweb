"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"

// Scroll position where the bar starts sticking
const getStickScrollTop = (sentinel: HTMLElement | null, bar: HTMLElement | null) => {
  if (sentinel === null || bar === null) {
    return null
  }

  const style = window.getComputedStyle(bar)
  const restingTop = sentinel.getBoundingClientRect().top + window.scrollY + Number.parseFloat(style.marginTop)

  return Math.max(0, restingTop - Number.parseFloat(style.top))
}

/**
 * Tracks whether a sticky bar is stuck, and scrolls back to the top of the content below it when `resetKey` changes.
 * The sentinel is an empty element right before the bar that marks where it sits when not stuck.
 */
export const useStickyBar = (resetKey: string) => {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const [isStuck, setIsStuck] = useState(false)
  // The browser may have clamped the scroll before the reset runs, so keep the last known state
  const isStuckRef = useRef(false)
  // Enables transitions after the first measurement, so loading scrolled down doesn't animate
  const [isSettled, setIsSettled] = useState(false)

  useEffect(() => {
    let frame: number | undefined

    const update = () => {
      frame = undefined
      const stickScrollTop = getStickScrollTop(sentinelRef.current, barRef.current)

      if (stickScrollTop === null) {
        return
      }

      const stuck = window.scrollY > stickScrollTop
      isStuckRef.current = stuck
      setIsStuck(stuck)
      setIsSettled(true)
    }

    const scheduleUpdate = () => {
      frame ??= window.requestAnimationFrame(update)
    }

    scheduleUpdate()
    window.addEventListener("scroll", scheduleUpdate, { passive: true })
    window.addEventListener("resize", scheduleUpdate)

    return () => {
      window.removeEventListener("scroll", scheduleUpdate)
      window.removeEventListener("resize", scheduleUpdate)

      if (frame !== undefined) {
        window.cancelAnimationFrame(frame)
      }
    }
  }, [])

  // Before paint, scroll to just past the stick point so new content starts at the top and the bar stays stuck
  const previousResetKeyRef = useRef(resetKey)

  useLayoutEffect(() => {
    if (previousResetKeyRef.current === resetKey) {
      return
    }

    previousResetKeyRef.current = resetKey
    const stickScrollTop = getStickScrollTop(sentinelRef.current, barRef.current)

    if (stickScrollTop !== null && (isStuckRef.current || window.scrollY > stickScrollTop)) {
      window.scrollTo({ top: stickScrollTop + 1, behavior: "instant" })
    }
  }, [resetKey])

  return { sentinelRef, barRef, isStuck, isSettled }
}
