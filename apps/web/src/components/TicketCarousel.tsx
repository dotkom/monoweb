"use client"

import { TicketQR, type TicketQRProps } from "@/components/TicketQR"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { useCallback, useRef, useState } from "react"

export function TicketCarousel({ tickets }: { tickets: TicketQRProps[] }) {
  const carouselRef = useRef<HTMLUListElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const scrollToTicket = useCallback((index: number) => {
    const carousel = carouselRef.current
    if (!carousel) return

    carousel.scrollTo({ left: index * carousel.clientWidth, behavior: "smooth" })
  }, [])

  if (tickets.length === 0) return null

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-4" aria-label="Billetter">
      <ul
        ref={carouselRef}
        className="m-0 flex list-none snap-x snap-mandatory overflow-x-auto scroll-smooth p-0 scrollbar-hide"
        onScroll={(event) => {
          const carousel = event.currentTarget
          if (carousel.clientWidth > 0) {
            setCurrentIndex(Math.round(carousel.scrollLeft / carousel.clientWidth))
          }
        }}
      >
        {tickets.map((ticket) => {
          return (
            <li key={ticket.ticketValue} className="w-full shrink-0 snap-center">
              <TicketQR {...ticket} />
            </li>
          )
        })}
      </ul>
      {tickets.length > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            aria-label="Forrige billett"
            disabled={currentIndex === 0}
            onClick={() => scrollToTicket(currentIndex - 1)}
            className="grid size-10 place-items-center rounded-full bg-gray-100 text-foreground transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-stone-800 dark:hover:bg-stone-700"
          >
            <IconChevronLeft aria-hidden="true" />
          </button>
          <span className="min-w-16 text-center text-sm text-muted-foreground" aria-live="polite">
            {currentIndex + 1} / {tickets.length}
          </span>
          <button
            type="button"
            aria-label="Neste billett"
            disabled={currentIndex === tickets.length - 1}
            onClick={() => scrollToTicket(currentIndex + 1)}
            className="grid size-10 place-items-center rounded-full bg-gray-100 text-foreground transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-stone-800 dark:hover:bg-stone-700"
          >
            <IconChevronRight aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  )
}
