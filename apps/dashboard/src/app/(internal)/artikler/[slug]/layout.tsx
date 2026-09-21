"use client"

import { ResourceDetailError } from "@/components/ResourceDetailLayout/ResourceDetailError"
import {
  ResourceDetailLayout,
  type ResourceDetailNavItem,
} from "@/components/ResourceDetailLayout/ResourceDetailLayout"
import { env } from "@/lib/env"
import { IconBuildingWarehouse } from "@tabler/icons-react"
import { useParams } from "next/navigation"
import type { PropsWithChildren } from "react"
import { useArticleBySlugQuery } from "../queries"
import { ArticleDetailsContext } from "./provider"

export default function ArticleDetailsLayout({ children }: PropsWithChildren) {
  const { slug: rawSlug } = useParams<{ slug: string }>()
  const slug = decodeURIComponent(rawSlug)
  const { data, isLoading, isError, error } = useArticleBySlugQuery(slug)

  if (isLoading) {
    return null
  }

  if (isError || !data) {
    return (
      <ResourceDetailError
        backHref="/artikler"
        title="Feil ved henting av artikkel"
        message={error?.message ?? "Ukjent feil"}
      />
    )
  }

  const basePath = `/artikler/${data.slug}`

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
      backHref="/artikler"
      navItems={navItems}
      viewInWebProps={{
        label: "Se artikkelen",
        href: `${env.NEXT_PUBLIC_WEB_URL}/artikler/${encodeURIComponent(data.slug)}/${data.id}`,
      }}
    >
      <ArticleDetailsContext.Provider value={{ article: data }}>{children}</ArticleDetailsContext.Provider>
    </ResourceDetailLayout>
  )
}
