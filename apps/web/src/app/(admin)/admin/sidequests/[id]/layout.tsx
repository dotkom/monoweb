"use client"

import { GroupLogo } from "@/components/atoms/GroupLogo"
import { ResourceDetailError } from "@admin/components/ResourceDetailLayout/ResourceDetailError"
import {
  ResourceDetailLayout,
  type ResourceDetailNavItem,
} from "@admin/components/ResourceDetailLayout/ResourceDetailLayout"
import { breadcrumbPath, useBreadcrumbLabel } from "@admin/lib/breadcrumb-context"
import { getGroupDisplayName } from "@dotkomonline/rpc/group"
import { SidequestStatusSchema } from "@dotkomonline/rpc/sidequest"
import { createAbsoluteSidequestPageUrl } from "@dotkomonline/utils"
import { IconListDetails, IconUser } from "@tabler/icons-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import type { PropsWithChildren } from "react"
import { env } from "src/env"
import { SidequestRequestStatusBadge } from "../components/SidequestRequestStatusBadge"
import { useUpdateSidequestMutation } from "../mutations"
import { useSidequestWithRequestQuery } from "../queries"
import { SidequestDetailsContext } from "./provider"

export default function SidequestDetailsLayout({ children }: PropsWithChildren) {
  const { id: rawId } = useParams<{ id: string }>()
  const id = decodeURIComponent(rawId)
  const { data, isLoading, isError, error } = useSidequestWithRequestQuery(id)

  const updateEvent = useUpdateSidequestMutation()
  const router = useRouter()

  useBreadcrumbLabel(breadcrumbPath("sidequests", id), data?.title ?? null)
  useBreadcrumbLabel(breadcrumbPath("sidequests", id, "pameldte"), "Påmeldte")

  if (isLoading) {
    return null
  }

  if (isError || !data) {
    return (
      <ResourceDetailError
        backHref="/admin/sidequests"
        title="Feil ved henting av Sidequest"
        message={error?.message ?? "Ukjent feil"}
      />
    )
  }

  const isPublished = data.status === SidequestStatusSchema.enum.PUBLISHED

  const basePath = `/admin/sidequests/${id}`
  const navItems: ResourceDetailNavItem[] = [
    {
      href: basePath,
      label: "Info",
      icon: IconListDetails,
    },
    {
      href: `${basePath}/pameldte`,
      label: "Påmeldte",
      icon: IconUser,
      disabled: !isPublished,
    },
  ]

  const groupDisplayName = getGroupDisplayName(data.interestGroup)

  const onDelete = () => {
    updateEvent.mutate(
      {
        id: data.id,
        sidequest: {
          status: SidequestStatusSchema.enum.DELETED,
        },
      },
      {
        onSuccess: () => {
          router.push("/admin/sidequests")
        },
      }
    )
  }

  return (
    <ResourceDetailLayout
      title={data.title}
      description={
        <div className="flex flex-row gap-2 items-center">
          <Link href={`/admin/grupper/${data.interestGroupId}`} className="flex items-center gap-2 hover:underline">
            <GroupLogo
              src={data.interestGroup.imageUrl}
              alt={groupDisplayName}
              width={16}
              height={16}
              containerClassName="rounded-full size-4 bg-gray-50 dark:bg-stone-700"
            />
            {groupDisplayName}
          </Link>
          <SidequestRequestStatusBadge status={data.status} />
        </div>
      }
      backHref="/admin/sidequests"
      navItems={navItems}
      copyIds={[{ value: data.id }]}
      viewInWebProps={
        isPublished
          ? {
              label: "Se Sidequest",
              href: createAbsoluteSidequestPageUrl(env.NEXT_PUBLIC_ORIGIN, data.id, data.title),
            }
          : undefined
      }
      onDelete={onDelete}
      deleteConfirmTitle={`Er du sikker på at du vil slette "${data.title}"?`}
    >
      <SidequestDetailsContext.Provider value={{ sidequest: data }}>{children}</SidequestDetailsContext.Provider>
    </ResourceDetailLayout>
  )
}
