"use client"

import type { Attendance, Committee } from "@dotkomonline/types"
import type { Event } from "@dotkomonline/types"
import { createContext, useContext } from "react"

/** Context consisting of everything required to use and render the form */
export const EventDetailsContext = createContext<{
  event: Event
  eventCommittees: Committee[]
  attendance: Attendance | null
} | null>(null)

export const useEventDetailsContext = () => {
  const ctx = useContext(EventDetailsContext)
  if (ctx === null) {
    throw new Error("useEventDetailsContext called without Provider in tree")
  }
  return ctx
}
