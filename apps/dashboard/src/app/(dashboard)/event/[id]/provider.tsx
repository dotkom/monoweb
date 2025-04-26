"use client"

import type { EventDetail } from "@dotkomonline/types"
import { createContext, useContext } from "react"

/** Context consisting of everything required to use and render the form */
export const EventDetailsContext = createContext<EventDetail | null>(null)

export const useEventDetailsContext = () => {
  const ctx = useContext(EventDetailsContext)
  if (ctx === null) {
    throw new Error("useEventDetailsContext called without Provider in tree")
  }
  return ctx
}
