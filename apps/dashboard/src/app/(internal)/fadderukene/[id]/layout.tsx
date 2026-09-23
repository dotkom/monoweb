"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { ResourceDetailError } from "@/components/ResourceDetailLayout/ResourceDetailError"
import {
  ResourceDetailLayout,
  type ResourceDetailNavItem,
} from "@/components/ResourceDetailLayout/ResourceDetailLayout"
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

  if (isLoading) {
    return null
  }

  if (isError || !data) {
    return (
      <ResourceDetailError
        backHref="/fadderukene"
        title="Feil ved henting av fadderuke"
        message={error?.message ?? "Ukjent feil"}
      />
    )
  }

  const basePath = `/fadderukene/${id}`

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
      backHref="/fadderukene"
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
