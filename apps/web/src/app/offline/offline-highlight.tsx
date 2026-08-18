"use client"

import { useEffect } from "react"

interface OfflineHighlightProps {
  offlineId: string
}

export function OfflineHighlight({ offlineId }: OfflineHighlightProps) {
  useEffect(() => {
    const element = document.getElementById(`offline-${offlineId}`)

    if (element !== null) {
      element.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [offlineId])

  return null
}
