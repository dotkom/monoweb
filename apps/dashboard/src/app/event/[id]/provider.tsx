"use client"

import type { EventDetail } from "@dotkomonline/types"
import { createContext, useContext } from "react"

/** Context consisting of everything required to use and render the form */
export const EventContext = createContext<EventDetail | null>(null)

export const useEventContext = () => {
  const ctx = useContext(EventContext)
  if (ctx === null) {
    throw new Error("useEventDetailsContext called without Provider in tree")
  }
  return ctx
}
