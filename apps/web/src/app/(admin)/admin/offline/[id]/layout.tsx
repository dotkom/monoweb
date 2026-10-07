"use client"

import { ResourceDetailError } from "@admin/components/ResourceDetailLayout/ResourceDetailError"
import {
  ResourceDetailLayout,
  type ResourceDetailNavItem,
} from "@admin/components/ResourceDetailLayout/ResourceDetailLayout"
import { breadcrumbPath, useBreadcrumbLabel } from "@admin/lib/breadcrumb-context"
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
        backHref="/admin/offline"
        title="Feil ved henting av offline"
        message={error?.message ?? "Ukjent feil"}
      />
    )
  }

  const basePath = `/admin/offline/${id}`

  const navItems: ResourceDetailNavItem[] = [
    {
      href: basePath,
      label: "Info",
      icon: IconBuildingWarehouse,
    },
  ]

  return (
    <ResourceDetailLayout
      title={data.title}
      copyIds={[{ value: data.id }]}
      backHref="/admin/offline"
      navItems={navItems}
    >
      <OfflineDetailsContext.Provider value={{ offline: data }}>{children}</OfflineDetailsContext.Provider>
    </ResourceDetailLayout>
  )
}
