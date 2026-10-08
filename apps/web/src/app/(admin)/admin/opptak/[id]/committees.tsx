"use client"

import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from "react"
import type { InterviewSlot } from "./kalender/faen"

export interface Committee {
  slug: string
  name: string
}

export const COMMITTEES: Committee[] = [
  { slug: "dotkom", name: "Dotkom" },
  { slug: "appkom", name: "Appkom" },
  { slug: "arrkom", name: "Arrkom" },
]

export interface CommitteeAvailability {
  slots: InterviewSlot[]
  updatedBy: string | null
  submittedAt: Date | null
}

type CommitteeAvailabilities = Record<string, CommitteeAvailability>

const CURRENT_USER_NAME = "Deg"

const createEmptyAvailabilities = (): CommitteeAvailabilities =>
  Object.fromEntries(COMMITTEES.map((committee) => [committee.slug, { slots: [], updatedBy: null, submittedAt: null }]))

interface CommitteeAvailabilityContextValue {
  availabilities: CommitteeAvailabilities
  setSlots: (committeeSlug: string, slots: InterviewSlot[]) => void
  submit: (committeeSlug: string) => void
}

const CommitteeAvailabilityContext = createContext<CommitteeAvailabilityContextValue | null>(null)

export const useCommitteeAvailabilities = () => {
  const ctx = useContext(CommitteeAvailabilityContext)

  if (ctx === null) {
    throw new Error("useCommitteeAvailabilities called without Provider in tree")
  }

  return ctx
}

export const getAvailabilityHours = (availability: CommitteeAvailability) => {
  const milliseconds = availability.slots.reduce(
    (total, slot) => total + (new Date(slot.end).getTime() - new Date(slot.start).getTime()),
    0
  )

  return milliseconds / 3_600_000
}

export function CommitteeAvailabilityProvider({ children }: PropsWithChildren) {
  const [availabilities, setAvailabilities] = useState<CommitteeAvailabilities>(createEmptyAvailabilities)

  const setSlots = useCallback((committeeSlug: string, slots: InterviewSlot[]) => {
    setAvailabilities((current) => ({
      ...current,
      [committeeSlug]: { ...current[committeeSlug], slots, updatedBy: CURRENT_USER_NAME },
    }))
  }, [])

  const submit = useCallback((committeeSlug: string) => {
    setAvailabilities((current) => ({
      ...current,
      [committeeSlug]: { ...current[committeeSlug], updatedBy: CURRENT_USER_NAME, submittedAt: new Date() },
    }))
  }, [])

  const value = useMemo(() => ({ availabilities, setSlots, submit }), [availabilities, setSlots, submit])

  return <CommitteeAvailabilityContext.Provider value={value}>{children}</CommitteeAvailabilityContext.Provider>
}
