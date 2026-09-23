"use client"

import { createContext, useContext } from "react"
import type { ApplicationPeriod } from "../opptak"

export interface ApplicationContextValue {
  application: ApplicationPeriod
}

export const ApplicationContext = createContext<ApplicationContextValue | null>(null)

export const useApplicationContext = () => {
  const ctx = useContext(ApplicationContext)

  if (ctx === null) {
    throw new Error("useApplicationContext called without Provider in tree")
  }

  return ctx
}
