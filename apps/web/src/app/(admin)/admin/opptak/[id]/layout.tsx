"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { ResourceDetailError } from "@admin/components/ResourceDetailLayout/ResourceDetailError"
import {
  ResourceDetailLayout,
  type ResourceDetailNavItem,
} from "@admin/components/ResourceDetailLayout/ResourceDetailLayout"
import { breadcrumbPath, useBreadcrumbLabel } from "@admin/lib/breadcrumb-context"
import { Matching } from "../components/Matching"
import { Tooltip, TooltipContent, TooltipTrigger } from "@dotkomonline/ui"
import {
  IconAddressBook,
  IconAlertTriangle,
  IconCalendarEvent,
  IconCheck,
  IconProgressCheck,
} from "@tabler/icons-react"
import { useParams, useRouter } from "next/navigation"
import type { PropsWithChildren } from "react"
import { ForTestingRevertPublishingAndMatching } from "../ForTestingRevertPublishingAndMatching"
import { ForTestingRoleSimulation } from "../ForTestingRoleSimulation"
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
    },
    ...(canManageInterviews
      ? [
          {
            href: `${basePath}/tilgjengelighet`,
            label: "Komitéer sin tilgjengelighet",
            icon: IconCalendarEvent,
            status:
              isAdministrator &&
              (incompleteAvailabilityCount === 0 ? (
                <IconCheck className="size-3.5 shrink-0 text-green-600 dark:text-green-400" />
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <IconAlertTriangle className="size-3.5 shrink-0 text-destructive" />
                  </TooltipTrigger>
                  <TooltipContent>
                    {`${incompleteAvailabilityCount} av ${applicationGroups.length} komitéer mangler tilgjengelighet`}
                  </TooltipContent>
                </Tooltip>
              )),
          },
        ]
      : []),
    { key: "matching", content: <Matching application={data} /> },
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
      actions={
        <>
          <ForTestingRevertPublishingAndMatching applicationPeriodId={data.id} />
          <ForTestingRoleSimulation />
        </>
      }
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
