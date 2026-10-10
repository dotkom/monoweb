"use client"

import { GroupLogo } from "@/components/atoms/GroupLogo"
import { ResourceDetailError } from "@admin/components/ResourceDetailLayout/ResourceDetailError"
import {
  ResourceDetailLayout,
  type ResourceDetailNavItem,
} from "@admin/components/ResourceDetailLayout/ResourceDetailLayout"
import { breadcrumbPath, useBreadcrumbLabel } from "@admin/lib/breadcrumb-context"
import { getGroupDisplayName } from "@dotkomonline/rpc/group"
import { createAbsoluteInterestGroupEventPageUrl } from "@dotkomonline/utils"
import { IconListDetails, IconUser } from "@tabler/icons-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import type { PropsWithChildren } from "react"
import { env } from "src/env"
import { InterestGroupEventRequestStatusBadge } from "../components/InterestGroupEventRequestStatusBadge"
import { useUpdateInterestGroupEventMutation } from "../mutations"
import { useInterestGroupEventWithRequestQuery } from "../queries"
import { InterestGroupEventDetailsContext } from "./provider"

export default function InterestGroupEventDetailsLayout({ children }: PropsWithChildren) {
  const { id: rawId } = useParams<{ id: string }>()
  const id = decodeURIComponent(rawId)
  const { data, isLoading, isError, error } = useInterestGroupEventWithRequestQuery(id)

  const updateEvent = useUpdateInterestGroupEventMutation()
  const router = useRouter()

  useBreadcrumbLabel(breadcrumbPath("interessegrupper", id), data?.title ?? null)
  useBreadcrumbLabel(breadcrumbPath("interessegrupper", id, "pameldte"), "Påmeldte")

  if (isLoading) {
    return null
  }

  if (isError || !data) {
    return (
      <ResourceDetailError
        backHref="/admin/interessegrupper"
        title="Feil ved henting av interessegruppearrangement"
        message={error?.message ?? "Ukjent feil"}
      />
    )
  }

  const isPublished = data.status === "PUBLISHED"

  const basePath = `/admin/interessegrupper/${id}`
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
        interestGroupEvent: {
          status: "DELETED",
        },
      },
      {
        onSuccess: () => {
          router.push("/admin/interessegrupper")
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
          <InterestGroupEventRequestStatusBadge status={data.status} />
        </div>
      }
      backHref="/admin/interessegrupper"
      navItems={navItems}
      copyIds={[{ value: data.id }]}
      viewInWebProps={
        isPublished
          ? {
              label: "Se interessegruppearrangementet",
              href: createAbsoluteInterestGroupEventPageUrl(env.NEXT_PUBLIC_ORIGIN, data.id, data.title),
            }
          : undefined
      }
      onDelete={onDelete}
      deleteConfirmTitle={`Er du sikker på at du vil slette "${data.title}"?`}
    >
      <InterestGroupEventDetailsContext.Provider value={{ interestGroupEvent: data }}>
        {children}
      </InterestGroupEventDetailsContext.Provider>
    </ResourceDetailLayout>
  )
}
