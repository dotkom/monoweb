"use client"

import { ErrorMessage } from "@/components/ResourceDetailLayout/ErrorMessage"
import {
  ResourceDetailLayout,
  type ResourceDetailNavItem,
} from "@/components/ResourceDetailLayout/ResourceDetailLayout"
import { env } from "@/lib/env"
import { IconBuildingWarehouse, IconCalendarEvent } from "@tabler/icons-react"
import { useParams } from "next/navigation"
import type { PropsWithChildren } from "react"
import { useCompanyBySlugQuery } from "../queries"
import { CompanyDetailsContext } from "./provider"

export default function CompanyDetailsLayout({ children }: PropsWithChildren) {
  const { slug: rawSlug } = useParams<{ slug: string }>()
  const slug = decodeURIComponent(rawSlug)
  const { data, isLoading, isError, error } = useCompanyBySlugQuery(slug)

  const basePath = `/bedrifter/${slug}`

  const navItems: ResourceDetailNavItem[] = [
    {
      href: basePath,
      label: "Info",
      icon: IconBuildingWarehouse,
    },
    {
      href: `${basePath}/arrangementer`,
      label: "Arrangementer",
      icon: IconCalendarEvent,
    },
  ]

  return (
    <ResourceDetailLayout
      title={data?.name}
      backHref="/bedrifter"
      navItems={navItems}
      viewInWebProps={{
        label: "Se bedriften",
        href: `${env.NEXT_PUBLIC_WEB_URL}/bedrifter/${slug}`,
      }}
      isLoading={isLoading}
      isError={isError}
    >
      {!isLoading && data ? (
        <CompanyDetailsContext.Provider value={{ company: data }}>{children}</CompanyDetailsContext.Provider>
      ) : (
        isError && <ErrorMessage>Feil ved henting av bedrift: {error?.message ?? "Ukjent feil"}</ErrorMessage>
      )}
    </ResourceDetailLayout>
  )
}
