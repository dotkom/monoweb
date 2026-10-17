"use client"

import type { CommitteeApplicationPeriod } from "@dotkomonline/rpc/committee-application"
import { createContext, useContext } from "react"

interface ApplicationContextValue {
  application: CommitteeApplicationPeriod
}

export const ApplicationContext = createContext<ApplicationContextValue | null>(null)

export const useApplicationContext = () => {
  const ctx = useContext(ApplicationContext)

  if (ctx === null) {
    throw new Error("useApplicationContext called without Provider in tree")
  }

  return ctx
}
