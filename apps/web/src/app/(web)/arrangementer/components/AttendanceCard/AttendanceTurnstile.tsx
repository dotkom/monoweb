import { useEffect, useRef, useState } from "react"
import Turnstile, { type TurnstileProps } from "react-turnstile"

type AttendanceTurnstileProps = TurnstileProps & {
  enabled: boolean
  defer?: boolean
  onStart: () => void
}

export function AttendanceTurnstile({ enabled, defer = false, onStart, ...props }: AttendanceTurnstileProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const container = containerRef.current

    if (defer === false || enabled === false || visible || container === null) {
      return
    }

    let cancelled = false

    const start = async () => {
      const drawer = container.closest<HTMLElement>('[data-slot="drawer-content"]')
      const animations = drawer?.getAnimations?.() ?? []

      // Let the drawer finish opening before starting Cloudflare's verification work.
      await Promise.allSettled(animations.map((animation) => animation.finished))

      if (cancelled === false) {
        setVisible(true)
        onStart()
      }
    }

    if (typeof IntersectionObserver === "undefined") {
      void start()

      return () => {
        cancelled = true
      }
    }

    // Verification can be expensive, so start it only when its widget is visible.
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect()
        void start()
      }
    })

    observer.observe(container)

    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [defer, enabled, visible, onStart])

  if (defer === false) {
    return enabled ? <Turnstile {...props} /> : null
  }

  return (
    <div ref={containerRef} className="h-[4.05rem]" data-vaul-no-drag>
      {enabled && visible && <Turnstile {...props} />}
    </div>
  )
}
