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
import { useMarkGetQuery } from "../queries"
import { MarkDetailsContext } from "./provider"

export default function MarkDetailsLayout({ children }: PropsWithChildren) {
  const { id } = useParams<{ id: string }>()
  const { mark, isLoading, isError, error } = useMarkGetQuery(id)

  useBreadcrumbLabel(breadcrumbPath("prikker", id), mark?.title ?? null)

  if (isLoading) {
    return null
  }

  if (isError || !mark) {
    return (
      <ResourceDetailError
        backHref="/admin/prikker"
        title="Feil ved henting av prikk"
        message={error?.message ?? "Ukjent feil"}
      />
    )
  }

  const basePath = `/admin/prikker/${id}`

  const navItems: ResourceDetailNavItem[] = [
    {
      href: basePath,
      label: "Info",
      icon: IconBuildingWarehouse,
    },
  ]

  return (
    <ResourceDetailLayout
      title={mark.title}
      copyIds={[{ value: mark.id }]}
      backHref="/admin/prikker"
      navItems={navItems}
    >
      <MarkDetailsContext.Provider value={{ mark }}>{children}</MarkDetailsContext.Provider>
    </ResourceDetailLayout>
  )
}
