"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { ResourceDetailError } from "@admin/components/ResourceDetailLayout/ResourceDetailError"
import {
  ResourceDetailLayout,
  type ResourceDetailNavItem,
} from "@admin/components/ResourceDetailLayout/ResourceDetailLayout"
import { breadcrumbPath, useBreadcrumbLabel } from "@admin/lib/breadcrumb-context"
import { CONFIRMED_MESSAGE, Matching } from "../components/Matching"
import { Progress } from "../components/Progress"
import { Tooltip, TooltipContent, TooltipTrigger } from "@dotkomonline/ui"
import { IconAlertTriangle, IconCalendar, IconCalendarTime, IconListDetails, IconUserSquare } from "@tabler/icons-react"
import { useParams, useRouter } from "next/navigation"
import type { PropsWithChildren } from "react"
import { useDeleteApplicationPeriodMutation } from "../mutations"
import { useApplicationPeriodGetQuery, useApplicationPeriodGroupsQuery } from "../queries"
import { ApplicationContext } from "./provider"

export default function ApplicationDetailsLayout({ children }: PropsWithChildren) {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data, isLoading, isError, error } = useApplicationPeriodGetQuery(id)
  const { applicationGroups } = useApplicationPeriodGroupsQuery(id)
  const remove = useDeleteApplicationPeriodMutation()

  useBreadcrumbLabel(breadcrumbPath("opptak", id), data?.name ?? null)
  useBreadcrumbLabel(breadcrumbPath("opptak", id, "tilgjengelighet"), "Tilgjengelighet")
  useBreadcrumbLabel(breadcrumbPath("opptak", id, "intervjuer"), "Intervjuer")
  useBreadcrumbLabel(breadcrumbPath("opptak", id, "sokere"), "Søkere")

  const { canEditApplication, canManageApplicationInterviews, isAdministrator } = useAuthorization()
  const canEdit = canEditApplication()
  const canManageInterviews = canManageApplicationInterviews()

  if (isLoading) {
    return null
  }

  if (isError || !data) {
    return (
      <ResourceDetailError
        backHref="/admin/opptak"
        title="Feil ved henting av opptak"
        message={error?.message ?? "Fant ikke opptaket"}
      />
    )
  }

  const basePath = `/admin/opptak/${id}`
  const incompleteAvailabilityCount = applicationGroups.filter(
    (group) => group.interviewBlockCount === 0 || !group.hasAllValidRooms
  ).length

  const navItems: ResourceDetailNavItem[] = [
    {
      href: basePath,
      label: "Info",
      icon: IconListDetails,
    },
    ...(canManageInterviews
      ? [
          {
            href: `${basePath}/tilgjengelighet`,
            label: "Tilgjengelighet",
            icon: IconCalendar,
            disabled: !isAdministrator && data.interviewsPublishedAt !== null,
            disabledReason: CONFIRMED_MESSAGE,
            status: isAdministrator && incompleteAvailabilityCount > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <IconAlertTriangle className="size-5 shrink-0 text-destructive" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {`Kun ${applicationGroups.length - incompleteAvailabilityCount}/${applicationGroups.length} komitéer har fylt ut tilgjengelighet`}
                </TooltipContent>
              </Tooltip>
            ),
          },
        ]
      : []),
    ...[
      { href: `${basePath}/intervjuer`, label: "Intervjuer", icon: IconCalendarTime },
      { href: `${basePath}/sokere`, label: "Søkere", icon: IconUserSquare },
    ].map((item) => ({
      ...item,
      disabled: data.interviewsPublishedAt === null,
      disabledReason: "Intervjuene er ikke publisert enda",
    })),
  ]

  return (
    <ResourceDetailLayout
      title={data.name}
      copyIds={[{ value: data.id }]}
      backHref="/admin/opptak"
      navItems={navItems}
      aside={isAdministrator && <Progress application={data} />}
      onDelete={() => {
        remove.mutate(
          { applicationPeriodId: data.id },
          {
            onSuccess: () => {
              router.replace("/admin/opptak")
            },
          }
        )
      }}
      actions={<Matching application={data} />}
      deleteConfirmTitle={`Er du sikker på at du vil slette ${data.name}?`}
      missingDeletePermission={
        canEdit
          ? undefined
          : "Du har ikke tilgang til å slette opptak. Kontakt dotkom dersom du mener dette er en feil."
      }
    >
      <ApplicationContext.Provider value={{ application: data }}>{children}</ApplicationContext.Provider>
    </ResourceDetailLayout>
  )
}
