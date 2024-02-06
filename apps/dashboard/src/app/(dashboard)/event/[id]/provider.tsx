"use client"

import { type Event, type EventCommittee } from "@dotkomonline/types"
import { createContext, useContext } from "react"

/** Context consisting of everything required to use and render the form */
export const EventDetailsContext = createContext<{
  event: Event
  eventCommittees: EventCommittee[]
} | null>(null)

export const useEventDetailsContext = () => {
  const ctx = useContext(EventDetailsContext)
  if (ctx === null) {
    throw new Error("useEventDetailsContext called without Provider in tree")
  }
  return ctx
}
