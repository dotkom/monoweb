"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { ResourceDetailError } from "@admin/components/ResourceDetailLayout/ResourceDetailError"
import {
  ResourceDetailLayout,
  type ResourceDetailNavItem,
} from "@admin/components/ResourceDetailLayout/ResourceDetailLayout"
import { breadcrumbPath, useBreadcrumbLabel } from "@admin/lib/breadcrumb-context"
import { IconBuildingWarehouse } from "@tabler/icons-react"
import { useParams } from "next/navigation"
import type { PropsWithChildren } from "react"
import { useDeleteFadderukeMutation } from "../mutations"
import { useFadderukeGetByIdQuery } from "../queries"
import { FadderukeDetailsContext } from "./provider"

export default function FadderukeDetailsLayout({ children }: PropsWithChildren) {
  const { id: rawId } = useParams<{ id: string }>()
  const id = decodeURIComponent(rawId)
  const { data, isLoading, isError, error } = useFadderukeGetByIdQuery(id)
  const deleteFadderuke = useDeleteFadderukeMutation()
  const { canEditFadderuke } = useAuthorization()
  const canEdit = canEditFadderuke()

  useBreadcrumbLabel(breadcrumbPath("fadderukene", id), data ? `Fadderukene ${data.year}` : null)

  if (isLoading) {
    return null
  }

  if (isError || !data) {
    return (
      <ResourceDetailError
        backHref="/admin/fadderukene"
        title="Feil ved henting av fadderuke"
        message={error?.message ?? "Ukjent feil"}
      />
    )
  }

  const basePath = `/admin/fadderukene/${id}`

  const navItems: ResourceDetailNavItem[] = [
    {
      href: basePath,
      label: "Info",
      icon: IconBuildingWarehouse,
    },
  ]

  return (
    <ResourceDetailLayout
      title={`Fadderukene ${data.year}`}
      copyIds={[{ value: data.id }]}
      backHref="/admin/fadderukene"
      navItems={navItems}
      onDelete={() => {
        deleteFadderuke.mutate({ fadderukeId: data.id })
      }}
      deleteConfirmTitle={`Er du sikker på at du vil slette fadderuken for ${data.year}?`}
      missingDeletePermission={
        canEdit
          ? undefined
          : "Du har ikke redigeringstilgang til denne fadderuken. Kontakt dotkom dersom du mener dette er en feil."
      }
      readOnlyNotice={
        canEdit
          ? undefined
          : {
              title: "Du kan ikke redigere fadderuken.",
              message: "Kontakt dotkom dersom du mener dette er en feil.",
            }
      }
    >
      <FadderukeDetailsContext.Provider value={{ fadderuke: data }}>{children}</FadderukeDetailsContext.Provider>
    </ResourceDetailLayout>
  )
}
