"use client"
import { useTRPC } from "@admin/lib/trpc-client"
import type { PropsWithChildren } from "react"

import { ResourceDetailError } from "@admin/components/ResourceDetailLayout/ResourceDetailError"
import {
  ResourceDetailLayout,
  type ResourceDetailNavItem,
} from "@admin/components/ResourceDetailLayout/ResourceDetailLayout"
import { breadcrumbPath, useBreadcrumbLabel } from "@admin/lib/breadcrumb-context"
import { env } from "@admin/lib/env"
import { createAbsoluteJobListingPageUrl } from "@dotkomonline/utils"
import { IconBuildingWarehouse } from "@tabler/icons-react"
import { useParams } from "next/navigation"
import { JobListingDetailsContext } from "./provider"

import { useQuery } from "@tanstack/react-query"

export default function JobListingDetailsLayout({ children }: PropsWithChildren) {
  const trpc = useTRPC()
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError, error } = useQuery(trpc.jobListing.get.queryOptions(id))

  useBreadcrumbLabel(breadcrumbPath("karriere", id), data?.title ?? null)

  if (isLoading) {
    return null
  }

  if (isError || !data) {
    return (
      <ResourceDetailError
        backHref="/admin/karriere"
        title="Feil ved henting av stillingsannonse"
        message={error?.message ?? "Ukjent feil"}
      />
    )
  }

  const basePath = `/admin/karriere/${id}`

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
      backHref="/admin/karriere"
      navItems={navItems}
      viewInWebProps={{
        label: "Se jobbutlysning",
        href: createAbsoluteJobListingPageUrl(env.NEXT_PUBLIC_WEB_URL, data.id, data.title),
      }}
    >
      <JobListingDetailsContext.Provider value={{ jobListing: data }}>{children}</JobListingDetailsContext.Provider>
    </ResourceDetailLayout>
  )
}
