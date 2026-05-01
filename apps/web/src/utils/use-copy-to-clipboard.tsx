"use client"

import { secondsToMilliseconds } from "date-fns"
import { useEffect, useState } from "react"

export function useCopyToClipboard(resetAfterMs = secondsToMilliseconds(2.5)) {
  const [icon, setIcon] = useState<"copy" | "check">("copy")

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setIcon("check")
  }

  useEffect(() => {
    if (icon !== "check") {
      return
    }

    const timeout = setTimeout(() => {
      setIcon("copy")
    }, resetAfterMs)

    return () => {
      clearTimeout(timeout)
    }
  }, [icon, resetAfterMs])

  return { icon, copy }
}
