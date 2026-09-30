"use client"

import { ResourceDetailError } from "@/components/ResourceDetailLayout/ResourceDetailError"
import {
  ResourceDetailLayout,
  type ResourceDetailNavItem,
} from "@/components/ResourceDetailLayout/ResourceDetailLayout"
import { breadcrumbPath, useBreadcrumbLabel } from "@/lib/breadcrumb-context"
import { IconBuildingWarehouse } from "@tabler/icons-react"
import { useParams } from "next/navigation"
import type { PropsWithChildren } from "react"
import { useOfflineByIdQuery } from "../queries"
import { OfflineDetailsContext } from "./provider"

export default function OfflineDetailsLayout({ children }: PropsWithChildren) {
  const { id: rawId } = useParams<{ id: string }>()
  const id = decodeURIComponent(rawId)
  const { data, isLoading, isError, error } = useOfflineByIdQuery(id)

  useBreadcrumbLabel(breadcrumbPath("offline", id), data?.title ?? null)

  if (isLoading) {
    return null
  }

  if (isError || !data) {
    return (
      <ResourceDetailError
        backHref="/offline"
        title="Feil ved henting av offline"
        message={error?.message ?? "Ukjent feil"}
      />
    )
  }

  const basePath = `/offline/${id}`

  const navItems: ResourceDetailNavItem[] = [
    {
      href: basePath,
      label: "Info",
      icon: IconBuildingWarehouse,
    },
  ]

  return (
    <ResourceDetailLayout title={data.title} copyIds={[{ value: data.id }]} backHref="/offline" navItems={navItems}>
      <OfflineDetailsContext.Provider value={{ offline: data }}>{children}</OfflineDetailsContext.Provider>
    </ResourceDetailLayout>
  )
}
