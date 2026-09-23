"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { ResourceDetailError } from "@/components/ResourceDetailLayout/ResourceDetailError"
import {
  ResourceDetailLayout,
  type ResourceDetailNavItem,
} from "@/components/ResourceDetailLayout/ResourceDetailLayout"
import { getGroupDisplayName } from "@dotkomonline/rpc/group"
import { IconCircles, IconListDetails, IconUsers, IconWheelchair } from "@tabler/icons-react"
import { useParams } from "next/navigation"
import type { PropsWithChildren } from "react"
import { useDeleteGroupMutation } from "../mutations"
import { useGroupGetQuery } from "../queries"
import { GroupDetailsContext } from "./provider"

export default function GroupDetailsLayout({ children }: PropsWithChildren) {
  const { id: rawId } = useParams<{ id: string }>()
  const id = decodeURIComponent(rawId)
  const { data, isLoading, isError, error } = useGroupGetQuery(id)
  const remove = useDeleteGroupMutation()
  const authorization = useAuthorization()
  const isInterestGroup = data?.type === "INTEREST_GROUP"
  const canDelete = data ? authorization.canDeleteGroup(data.slug, isInterestGroup) : false
  const canEdit = data
    ? authorization.canUpdateGroup(data.slug, isInterestGroup) ||
      authorization.canManageGroupMembership(data.slug, isInterestGroup) ||
      authorization.canManageGroupRoles(data.slug, isInterestGroup)
    : false

  if (isLoading) {
    return null
  }

  if (isError || !data) {
    return (
      <ResourceDetailError
        backHref="/grupper"
        title="Feil ved henting av gruppe"
        message={error?.message ?? "Ukjent feil"}
      />
    )
  }

  const basePath = `/grupper/${id}`

  const navItems: ResourceDetailNavItem[] = [
    {
      href: basePath,
      label: "Info",
      icon: IconListDetails,
    },
    {
      href: `${basePath}/medlemmer`,
      label: "Medlemmer",
      icon: IconUsers,
      match: "prefix",
    },
    {
      href: `${basePath}/roller`,
      label: "Roller",
      icon: IconCircles,
    },
    {
      href: `${basePath}/arrangementer`,
      label: "Arrangementer",
      icon: IconWheelchair,
    },
  ]

  return (
    <ResourceDetailLayout
      title={getGroupDisplayName(data)}
      backHref="/grupper"
      navItems={navItems}
      onDelete={() => {
        remove.mutate(data.slug)
      }}
      deleteConfirmTitle={`Er du sikker på at du vil slette ${getGroupDisplayName(data)}?`}
      missingDeletePermission={
        canDelete
          ? undefined
          : "Du har ikke tilgang til å slette denne gruppen. Kontakt dotkom dersom du mener dette er en feil."
      }
      readOnlyNotice={
        canEdit
          ? undefined
          : {
              title: "Du kan ikke redigere gruppen.",
              message: "Dette er fordi du ikke er medlem av gruppen. Kontakt dotkom dersom du mener dette er en feil.",
            }
      }
    >
      <GroupDetailsContext.Provider value={{ group: data }}>{children}</GroupDetailsContext.Provider>
    </ResourceDetailLayout>
  )
}
