"use client"

import { cn } from "@dotkomonline/ui"
import { type ReactNode, useEffect, useState } from "react"

const TRANSITION_DURATION_MS = 260

interface AttendanceSectionProps {
  children: ReactNode
  className?: string
  contentClassName?: string
}

export const AttendanceSection = ({ children, className, contentClassName }: AttendanceSectionProps) => {
  const isVisible = children !== null && children !== undefined && children !== false
  const [retainedContent, setRetainedContent] = useState(isVisible ? children : null)

  if (isVisible && retainedContent !== children) {
    setRetainedContent(children)
  }

  useEffect(() => {
    if (isVisible || retainedContent === null) {
      return
    }

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setRetainedContent(null)
      return
    }

    const timeoutId = window.setTimeout(() => setRetainedContent(null), TRANSITION_DURATION_MS)

    return () => window.clearTimeout(timeoutId)
  }, [isVisible, retainedContent])

  return (
    <div
      aria-hidden={!isVisible}
      inert={!isVisible}
      className={cn(
        "grid min-w-0 transition-[grid-template-rows,opacity] duration-260 ease-smooth motion-reduce:transition-none",
        isVisible ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        className
      )}
      onTransitionEnd={(event) => {
        if (event.target !== event.currentTarget || event.propertyName !== "grid-template-rows" || isVisible) {
          return
        }

        setRetainedContent(null)
      }}
    >
      <div className="min-h-0 min-w-0 overflow-hidden">
        <div className={contentClassName}>{retainedContent}</div>
      </div>
    </div>
  )
}
