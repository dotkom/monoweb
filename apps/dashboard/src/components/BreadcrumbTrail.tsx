"use client"

import { breadcrumbPath, resolveBreadcrumbTrailLabels, useBreadcrumbTrail } from "@/lib/breadcrumb-context"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@dotkomonline/ui"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Fragment } from "react"

export function BreadcrumbTrail() {
  const rawPathname = usePathname()
  const pathname = decodeURIComponent(rawPathname)
  const { labels, pendingFromPrefix } = useBreadcrumbTrail()

  const parts = pathname.split("/").filter((part) => part.length > 0)

  if (parts.length === 0) {
    return null
  }

  const trailLabels = resolveBreadcrumbTrailLabels(parts, labels, pendingFromPrefix)

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href="/" />}>Hjem</BreadcrumbLink>
        </BreadcrumbItem>
        {parts.map((_, index) => {
          const href = breadcrumbPath(...parts.slice(0, index + 1))
          const label = trailLabels[index]

          return (
            <Fragment key={href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href={href} />}>
                  {label !== null ? (
                    label
                  ) : (
                    <div className="h-5 flex items-center">
                      <div className="w-16 h-3.5 animate-pulse bg-gray-300 dark:bg-stone-700 rounded" />
                    </div>
                  )}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
