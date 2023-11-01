"use client"

import { createContext, useContext } from "react"
import { type User } from "@dotkomonline/types"

/** Context consisting of everything required to use and render the form */
export const UserDetailsContext = createContext<{
  user: User
} | null>(null)

export const useUserDetailsContext = () => {
  const ctx = useContext(UserDetailsContext)
  if (ctx === null) {
    throw new Error("useUserDetailsContext called without Provider in tree")
  }
  return ctx
}
