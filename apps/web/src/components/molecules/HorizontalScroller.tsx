"use client"

import { Button, cn } from "@dotkomonline/ui"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { type FC, type ReactNode, useCallback, useEffect, useRef, useState } from "react"

interface HorizontalScrollerProps {
  children: ReactNode
  className?: string
}

/**
 * A horizontally scrolling row with snapping. On desktop it shows arrow buttons on the sides, since a hidden scrollbar
 * is hard to discover with a mouse.
 */
export const HorizontalScroller: FC<HorizontalScrollerProps> = ({ children, className }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = useCallback(() => {
    const element = scrollRef.current
    if (element === null) {
      return
    }

    // 1px tolerance for subpixel rounding
    setCanScrollLeft(element.scrollLeft > 1)
    setCanScrollRight(element.scrollLeft + element.clientWidth < element.scrollWidth - 1)
  }, [])

  useEffect(() => {
    const element = scrollRef.current
    if (element === null) {
      return
    }

    updateScrollState()

    const resizeObserver = new ResizeObserver(updateScrollState)
    resizeObserver.observe(element)
    element.addEventListener("scroll", updateScrollState, { passive: true })

    return () => {
      resizeObserver.disconnect()
      element.removeEventListener("scroll", updateScrollState)
    }
  }, [updateScrollState])

  const scrollByPage = (direction: -1 | 1) => {
    const element = scrollRef.current
    if (element === null) {
      return
    }

    element.scrollBy({ left: direction * element.clientWidth, behavior: "smooth" })
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className={cn("flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2", className)}
      >
        {children}
      </div>

      <ScrollButton direction="left" visible={canScrollLeft} onClick={() => scrollByPage(-1)} />
      <ScrollButton direction="right" visible={canScrollRight} onClick={() => scrollByPage(1)} />
    </div>
  )
}

interface ScrollButtonProps {
  direction: "left" | "right"
  visible: boolean
  onClick: () => void
}

const ScrollButton: FC<ScrollButtonProps> = ({ direction, visible, onClick }) => {
  const Icon = direction === "left" ? IconChevronLeft : IconChevronRight

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      aria-label={direction === "left" ? "Scroll til venstre" : "Scroll til høyre"}
      tabIndex={visible ? 0 : -1}
      className={cn(
        // Centered on the cards; -mt-1 compensates for the scroll row's bottom padding (pb-2)
        "hidden md:flex absolute top-1/2 -mt-1 -translate-y-1/2 z-10 size-12 rounded-full",
        "bg-white dark:bg-stone-800 shadow-lg ring-1 ring-gray-300 dark:ring-stone-600",
        "hover:bg-gray-100 hover:scale-105 dark:hover:bg-stone-700 transition-all cursor-pointer",
        direction === "left" ? "-left-5" : "-right-5",
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <Icon className="size-6" stroke={2.5} />
    </Button>
  )
}
