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
import {
  IconAddressBook,
  IconAlertTriangle,
  IconCalendarEvent,
  IconCheck,
  IconListDetails,
  IconProgressCheck,
} from "@tabler/icons-react"
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
  useBreadcrumbLabel(breadcrumbPath("opptak", id, "tilgjengelighet"), "Komitéer sin tilgjengelighet")
  useBreadcrumbLabel(breadcrumbPath("opptak", id, "intervjutider"), "Tidsskjema for intervjuer")
  useBreadcrumbLabel(breadcrumbPath("opptak", id, "opplysninger"), "Søkeropplysninger")

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
            label: "Komitéer sin tilgjengelighet",
            icon: IconCalendarEvent,
            disabled: !isAdministrator && data.interviewsPublishedAt !== null,
            disabledReason: CONFIRMED_MESSAGE,
            status: isAdministrator && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    {incompleteAvailabilityCount === 0 ? (
                      <IconCheck className="size-5 shrink-0 text-green-600 dark:text-green-400" />
                    ) : (
                      <IconAlertTriangle className="size-5 shrink-0 text-destructive" />
                    )}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {incompleteAvailabilityCount === 0
                    ? `${applicationGroups.length}/${applicationGroups.length} komitéer har sendt inn gyldig tilgjengelighet`
                    : `${incompleteAvailabilityCount} av ${applicationGroups.length} komitéer mangler tilgjengelighet`}
                </TooltipContent>
              </Tooltip>
            ),
          },
        ]
      : []),
    ...[
      { href: `${basePath}/intervjutider`, label: "Tidsskjema for intervjuer", icon: IconProgressCheck },
      { href: `${basePath}/opplysninger`, label: "Søkeropplysninger", icon: IconAddressBook },
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
