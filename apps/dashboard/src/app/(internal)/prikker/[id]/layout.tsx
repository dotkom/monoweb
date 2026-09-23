"use client"

import { ResourceDetailError } from "@/components/ResourceDetailLayout/ResourceDetailError"
import {
  ResourceDetailLayout,
  type ResourceDetailNavItem,
} from "@/components/ResourceDetailLayout/ResourceDetailLayout"
import { IconBuildingWarehouse } from "@tabler/icons-react"
import { useParams } from "next/navigation"
import type { PropsWithChildren } from "react"
import { useMarkGetQuery } from "../queries"
import { MarkDetailsContext } from "./provider"

export default function MarkDetailsLayout({ children }: PropsWithChildren) {
  const { id } = useParams<{ id: string }>()
  const { mark, isLoading, isError, error } = useMarkGetQuery(id)

  if (isLoading) {
    return null
  }

  if (isError || !mark) {
    return (
      <ResourceDetailError
        backHref="/prikker"
        title="Feil ved henting av prikk"
        message={error?.message ?? "Ukjent feil"}
      />
    )
  }

  const basePath = `/prikker/${id}`

  const navItems: ResourceDetailNavItem[] = [
    {
      href: basePath,
      label: "Info",
      icon: IconBuildingWarehouse,
    },
  ]

  return (
    <ResourceDetailLayout title={mark.title} backHref="/prikker" navItems={navItems}>
      <MarkDetailsContext.Provider value={{ mark }}>{children}</MarkDetailsContext.Provider>
    </ResourceDetailLayout>
  )
}
