"use client"

import { TicketQR, type TicketQRProps } from "@/components/TicketQR"
import { useEffect, useRef, useState } from "react"

export function TicketStack({ tickets }: { tickets: TicketQRProps[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const nudgeRef = useRef<HTMLDivElement>(null)
  const swipeStart = useRef<{ x: number; y: number; id: number } | null>(null)
  const suppressClickUntil = useRef(0)
  const activeIndex = Math.min(selectedIndex, Math.max(0, tickets.length - 1))

  useEffect(() => {
    const element = nudgeRef.current
    if (!element || tickets.length < 2) return

    const media = window.matchMedia("(max-width: 767px) and (prefers-reduced-motion: no-preference)")
    let animation: Animation | undefined

    const updateAnimation = () => {
      animation?.cancel()
      animation = media.matches
        ? element.animate(
            [
              { transform: "translateX(0)", offset: 0, easing: "ease-in-out" },
              { transform: "translateX(-12px)", offset: 0.012, easing: "ease-in-out" },
              { transform: "translateX(0)", offset: 800 / 30_000 },
              { transform: "translateX(0)", offset: 1 },
            ],
            { duration: 30_000, delay: 800, iterations: Number.POSITIVE_INFINITY }
          )
        : undefined
    }

    updateAnimation()
    media.addEventListener("change", updateAnimation)
    return () => {
      media.removeEventListener("change", updateAnimation)
      animation?.cancel()
    }
  }, [tickets.length])

  if (tickets.length === 0) return null

  return (
    <div className="flex flex-col gap-4">
      {tickets.length > 1 && (
        <fieldset className="flex flex-wrap justify-center gap-2" aria-label="Velg billett">
          {tickets.map((ticket, index) => (
            <button
              key={ticket.ticketValue}
              type="button"
              aria-pressed={index === activeIndex}
              onClick={() => setSelectedIndex(index)}
              className="rounded-lg px-3 py-2 text-sm font-medium cursor-pointer bg-gray-100 dark:bg-stone-800 aria-pressed:bg-[#0b5374] aria-pressed:text-white focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {ticket.title}
            </button>
          ))}
        </fieldset>
      )}
      <div
        className="relative isolate grid [--stack-offset:32px]"
        style={{
          paddingBottom: `calc(${tickets.length - 1} * var(--stack-offset))`,
          touchAction: tickets.length > 1 ? "pan-y pinch-zoom" : undefined,
        }}
        onTouchStart={(event) => {
          swipeStart.current = null
          suppressClickUntil.current = 0
          if (tickets.length < 2 || event.touches.length !== 1) return
          if (event.target instanceof Element && event.target.closest("dialog")) return

          const touch = event.touches[0]
          swipeStart.current = { x: touch.clientX, y: touch.clientY, id: touch.identifier }
        }}
        onTouchCancel={() => {
          swipeStart.current = null
        }}
        onTouchEnd={(event) => {
          const start = swipeStart.current
          swipeStart.current = null
          if (!start || tickets.length < 2) return

          const touch = Array.from(event.changedTouches).find((touch) => touch.identifier === start.id)
          if (!touch) return

          const distanceX = touch.clientX - start.x
          const distanceY = Math.abs(touch.clientY - start.y)
          if (Math.abs(distanceX) < 50 || Math.abs(distanceX) < distanceY * 1.25) return

          suppressClickUntil.current = performance.now() + 500
          const direction = distanceX < 0 ? 1 : -1
          setSelectedIndex((activeIndex + direction + tickets.length) % tickets.length)
        }}
        onClickCapture={(event) => {
          if (performance.now() < suppressClickUntil.current) {
            event.preventDefault()
            event.stopPropagation()
          }
        }}
      >
        {tickets.map((ticket, index) => {
          const depth = (index - activeIndex + tickets.length) % tickets.length

          return (
            <div
              key={ticket.ticketValue}
              inert={index !== activeIndex}
              aria-hidden={index !== activeIndex}
              className="col-start-1 row-start-1 flex flex-col justify-end min-w-0 origin-bottom transition-transform duration-200 motion-reduce:transition-none"
              style={{
                zIndex: tickets.length - depth,
                transform: `translateY(calc(${depth} * var(--stack-offset))) scale(${Math.max(0.8, 1 - depth * 0.02)})`,
              }}
            >
              <div ref={index === 0 ? nudgeRef : undefined}>
                <TicketQR {...ticket} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
