"use client"

import type { EventWithAttendance } from "@dotkomonline/types"
import { createContext, useContext } from "react"

/** Context consisting of everything required to use and render the form */
export const EventContext = createContext<EventWithAttendance | null>(null)

export const useEventContext = () => {
  const ctx = useContext(EventContext)
  if (ctx === null) {
    throw new Error("useEventWithAttendancesContext called without Provider in tree")
  }
  return ctx
}
