"use client"
import { useTRPC } from "@/lib/trpc-client"
import type { PropsWithChildren } from "react"

import { ResourceDetailError } from "@/components/ResourceDetailLayout/ResourceDetailError"
import {
  ResourceDetailLayout,
  type ResourceDetailNavItem,
} from "@/components/ResourceDetailLayout/ResourceDetailLayout"
import { env } from "@/lib/env"
import { IconBuildingWarehouse } from "@tabler/icons-react"
import { useParams } from "next/navigation"
import { JobListingDetailsContext } from "./provider"

import { useQuery } from "@tanstack/react-query"

export default function JobListingDetailsLayout({ children }: PropsWithChildren) {
  const trpc = useTRPC()
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError, error } = useQuery(trpc.jobListing.get.queryOptions(id))

  if (isLoading) {
    return null
  }

  if (isError || !data) {
    return (
      <ResourceDetailError
        backHref="/karriere"
        title="Feil ved henting av stillingsannonse"
        message={error?.message ?? "Ukjent feil"}
      />
    )
  }

  const basePath = `/karriere/${id}`

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
      backHref="/karriere"
      navItems={navItems}
      viewInWebProps={{
        label: "Se stillingsannonse",
        href: `${env.NEXT_PUBLIC_WEB_URL}/karriere/${encodeURIComponent(data.id)}`,
      }}
    >
      <JobListingDetailsContext.Provider value={{ jobListing: data }}>{children}</JobListingDetailsContext.Provider>
    </ResourceDetailLayout>
  )
}
