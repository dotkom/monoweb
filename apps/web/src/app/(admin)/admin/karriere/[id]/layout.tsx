"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { ResourceDetailError } from "@admin/components/ResourceDetailLayout/ResourceDetailError"
import {
  ResourceDetailLayout,
  type ResourceDetailNavItem,
} from "@admin/components/ResourceDetailLayout/ResourceDetailLayout"
import { breadcrumbPath, useBreadcrumbLabel } from "@admin/lib/breadcrumb-context"
import { env } from "@admin/lib/env"
import { useTRPC } from "@admin/lib/trpc-client"
import { canManageJobListings } from "@dotkomonline/rpc/job-listing-permissions"
import { createAbsoluteJobListingPageUrl } from "@dotkomonline/utils"
import { IconBuildingWarehouse } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import type { PropsWithChildren } from "react"
import { JobListingDetailsContext } from "./provider"

export default function JobListingDetailsLayout({ children }: PropsWithChildren) {
  const trpc = useTRPC()
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError, error } = useQuery(trpc.jobListing.get.queryOptions(id))
  const authorization = useAuthorization()
  const canEdit = canManageJobListings(authorization)

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
      readOnlyNotice={
        canEdit
          ? undefined
          : {
              title: "Du kan ikke redigere stillingsannonsen.",
              message: "Kontakt dotkom dersom du mener dette er en feil.",
            }
      }
    >
      <JobListingDetailsContext.Provider value={{ jobListing: data }}>{children}</JobListingDetailsContext.Provider>
    </ResourceDetailLayout>
  )
}
