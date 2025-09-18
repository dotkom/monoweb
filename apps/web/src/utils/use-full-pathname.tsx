"use client"

import { usePathname, useSearchParams } from "next/navigation"

export const useFullPathname = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (searchParams.size === 0) {
    return pathname
  }

  return `${pathname}?${searchParams.toString()}`
}
