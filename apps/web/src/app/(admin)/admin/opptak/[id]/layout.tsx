"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { ResourceDetailError } from "@admin/components/ResourceDetailLayout/ResourceDetailError"
import {
  ResourceDetailLayout,
  type ResourceDetailNavItem,
} from "@admin/components/ResourceDetailLayout/ResourceDetailLayout"
import { breadcrumbPath, useBreadcrumbLabel } from "@admin/lib/breadcrumb-context"
import { IconCalendarMonth, IconListDetails, IconProgressCheck } from "@tabler/icons-react"
import { useParams } from "next/navigation"
import { createContext, type PropsWithChildren, useContext } from "react"
import { type ApplicationPeriod, testApplicationPeriods } from "../opptak"
import { CommitteeAvailabilityProvider } from "./committees"

export interface ApplicationContextValue {
  application: ApplicationPeriod
}

export const ApplicationContext = createContext<ApplicationContextValue | null>(null)

export const useApplicationContext = () => {
  const ctx = useContext(ApplicationContext)

  if (ctx === null) {
    throw new Error("useApplicationContext called without Provider in tree")
  }

  return ctx
}

export default function ApplicationDetailsLayout({ children }: PropsWithChildren) {
  const { id } = useParams<{ id: string }>()
  const application = testApplicationPeriods.find((applicationPeriod) => applicationPeriod.id === id)

  useBreadcrumbLabel(breadcrumbPath("opptak", id), application?.name ?? null)
  useBreadcrumbLabel(breadcrumbPath("opptak", id, "kalender"), "Kalender")
  useBreadcrumbLabel(breadcrumbPath("opptak", id, "status"), "Status")

  const { canEditApplication } = useAuthorization()
  const canEdit = canEditApplication()

  if (!application) {
    return (
      <ResourceDetailError backHref="/admin/opptak" title="Feil ved henting av opptak" message="Fant ikke opptaket" />
    )
  }

  const basePath = `/admin/opptak/${id}`

  const navItems: ResourceDetailNavItem[] = [
    {
      href: basePath,
      label: "Info",
      icon: IconListDetails,
    },
    {
      href: `${basePath}/kalender`,
      label: "Kalender",
      icon: IconCalendarMonth,
    },
    {
      href: `${basePath}/status`,
      label: "Status",
      icon: IconProgressCheck,
    },
  ]

  return (
    <ResourceDetailLayout
      title={application.name}
      copyIds={[{ value: application.id }]}
      backHref="/admin/opptak"
      navItems={navItems}
      readOnlyNotice={
        canEdit
          ? undefined
          : {
              title: "Du kan ikke redigere opptaket.",
              message: "Dette er fordi du ikke er administrator. Kontakt dotkom dersom du mener dette er en feil.",
            }
      }
    >
      <ApplicationContext.Provider value={{ application }}>
        <CommitteeAvailabilityProvider>{children}</CommitteeAvailabilityProvider>
      </ApplicationContext.Provider>
    </ResourceDetailLayout>
  )
}
