"use client"

import { RollingNumber } from "@/components/RollingNumber"
import { Text, cn } from "@dotkomonline/ui"
import { useState } from "react"

interface QueueCountProps {
  value: number
  className?: string
}

export const QueueCount = ({ value, className }: QueueCountProps) => {
  const isVisible = value > 0
  const [lastVisibleContent, setLastVisibleContent] = useState({ value, className })

  // Keep the outgoing count and its highlight intact throughout the exit transition.
  if (isVisible && (lastVisibleContent.value !== value || lastVisibleContent.className !== className)) {
    setLastVisibleContent({ value, className })
  }

  return (
    <div
      aria-hidden={!isVisible}
      className={cn(
        "grid transition-[grid-template-rows] duration-260 ease-in-out motion-reduce:transition-none",
        isVisible ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}
    >
      <div className="min-h-0 overflow-hidden">
        <Text
          className={cn(
            "text-lg mt-1 px-2 py-0.5 transform-gpu transition-opacity duration-260 ease-in-out motion-reduce:transition-none",
            isVisible ? "opacity-100" : "opacity-0",
            lastVisibleContent.className
          )}
          suppressHydrationWarning
        >
          +<RollingNumber key={isVisible ? "visible" : "hidden"} value={lastVisibleContent.value} /> i kø
        </Text>
      </div>
    </div>
  )
}
