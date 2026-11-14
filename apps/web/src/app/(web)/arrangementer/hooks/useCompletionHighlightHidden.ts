"use client"

import { useCallback, useEffect, useState } from "react"
import { getCompletionHighlightHiddenFromCookie, setCompletionHighlightHiddenCookie } from "./completionHighlightCookie"

export const useCompletionHighlightHidden = () => {
  const [isHighlightHidden, setIsHighlightHidden] = useState(false)

  useEffect(() => {
    setIsHighlightHidden(getCompletionHighlightHiddenFromCookie())
  }, [])

  const toggleHighlightHidden = useCallback(() => {
    setIsHighlightHidden((current) => {
      const next = !current
      setCompletionHighlightHiddenCookie(next)
      return next
    })
  }, [])

  return {
    isHighlightHidden,
    toggleHighlightHidden,
  }
}
