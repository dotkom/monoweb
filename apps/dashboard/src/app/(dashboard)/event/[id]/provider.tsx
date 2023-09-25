"use client"

import { createContext, useContext } from "react"
import { Event } from "@dotkomonline/types"

/** Context consisting of everything required to use and render the form */
export const EventDetailsContext = createContext<{
    event: Event
} | null>(null)

export const useEventDetailsContext = () => {
    const ctx = useContext(EventDetailsContext)
    if (ctx === null) {
        throw new Error("useEventDetailsContext called without Provider in tree")
    }
    return ctx
}