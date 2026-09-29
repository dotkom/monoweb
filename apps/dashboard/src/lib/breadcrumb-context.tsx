"use client"

import { navigationBreadcrumbLabels } from "@/lib/navigation"
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react"

type BreadcrumbLabel = Record<string, string>

const BreadcrumbLabelsContext = createContext<{
  labels: BreadcrumbLabel
  pendingFromPrefix: string | null
  setLabels: Dispatch<SetStateAction<BreadcrumbLabel>>
  setPendingFromPrefix: Dispatch<SetStateAction<string | null>>
} | null>(null)

export function breadcrumbPath(...segments: string[]): string {
  return `/${segments.map((segment) => encodeURIComponent(segment)).join("/")}`
}

export function resolveBreadcrumbTrailLabels(
  parts: readonly string[],
  labels: BreadcrumbLabel,
  pendingFromPrefix: string | null = null,
  navigationLabels: BreadcrumbLabel = navigationBreadcrumbLabels
): (string | null)[] {
  const resolved = parts.map((_, index): string | undefined => {
    const href = breadcrumbPath(...parts.slice(0, index + 1))
    const isHidden =
      pendingFromPrefix !== null && (href === pendingFromPrefix || href.startsWith(`${pendingFromPrefix}/`))

    return isHidden ? navigationLabels[href] : (labels[href] ?? navigationLabels[href])
  })

  const firstUnknownIdx = resolved.indexOf(undefined)
  if (firstUnknownIdx === -1) {
    return resolved as string[]
  }

  const visibleLabels = resolved.slice(0, firstUnknownIdx)
  const hiddenLabels = resolved.slice(firstUnknownIdx)

  return [...visibleLabels, ...hiddenLabels.map(() => null)] as (string | null)[]
}

function writeLabel(setLabels: Dispatch<SetStateAction<BreadcrumbLabel>>, href: string, label: string | undefined) {
  setLabels((previous) => {
    if (label === undefined) {
      if (previous[href] === undefined) {
        return previous
      }

      const { [href]: _removed, ...rest } = previous
      return rest
    }

    if (previous[href] === label) {
      return previous
    }

    return { ...previous, [href]: label }
  })
}

function writePendingFromPrefix(setPendingFromPrefix: Dispatch<SetStateAction<string | null>>, prefix: string | null) {
  setPendingFromPrefix((previous) => (previous === prefix ? previous : prefix))
}

export function BreadcrumbProvider({ children }: PropsWithChildren) {
  const [labels, setLabels] = useState<BreadcrumbLabel>({})
  const [pendingFromPrefix, setPendingFromPrefix] = useState<string | null>(null)

  const value = useMemo(
    () => ({
      labels,
      pendingFromPrefix,
      setLabels,
      setPendingFromPrefix,
    }),
    [labels, pendingFromPrefix]
  )

  return <BreadcrumbLabelsContext.Provider value={value}>{children}</BreadcrumbLabelsContext.Provider>
}

function useBreadcrumbContext() {
  const context = useContext(BreadcrumbLabelsContext)

  if (context === null) {
    throw new Error("useBreadcrumbLabel must be used within BreadcrumbProvider")
  }

  return context
}

export function useBreadcrumbTrail() {
  const { labels, pendingFromPrefix } = useBreadcrumbContext()

  return { labels, pendingFromPrefix }
}

export function useBreadcrumbLabel(href: string, label: string | null | undefined, setPendingFrom?: string) {
  const { setLabels, setPendingFromPrefix } = useBreadcrumbContext()
  const hasLabel = label !== null && label !== undefined && label.length > 0

  useEffect(() => {
    if (setPendingFrom !== undefined) {
      writePendingFromPrefix(setPendingFromPrefix, hasLabel ? null : setPendingFrom)
    }

    if (hasLabel) {
      writeLabel(setLabels, href, label)
    }

    return () => {
      if (hasLabel) {
        writeLabel(setLabels, href, undefined)
      }

      if (setPendingFrom !== undefined) {
        writePendingFromPrefix(setPendingFromPrefix, null)
      }
    }
  }, [href, label, hasLabel, setPendingFrom, setLabels, setPendingFromPrefix])
}
