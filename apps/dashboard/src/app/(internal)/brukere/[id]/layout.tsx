"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { ResourceDetailError } from "@/components/ResourceDetailLayout/ResourceDetailError"
import {
  ResourceDetailLayout,
  type ResourceDetailNavItem,
} from "@/components/ResourceDetailLayout/ResourceDetailLayout"
import { env } from "@/lib/env"
import { useTRPC } from "@/lib/trpc-client"
import { findActiveMembership, getMembershipTypeName } from "@dotkomonline/rpc/user"
import { getStudyGrade } from "@dotkomonline/utils"
import {
  IconBuildingWarehouse,
  IconCampfire,
  IconCircles,
  IconClipboardList,
  IconExclamationMark,
  IconWheelchair,
} from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { useUser } from "@auth0/nextjs-auth0/client"
import { usePathname } from "next/navigation"
import { type PropsWithChildren, use, useMemo } from "react"
import { UserDetailsContext } from "./provider"

export default function UserDetailsLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
  const trpc = useTRPC()
  const id = decodeURIComponent(use(params).id)
  const pathname = usePathname()
  const authorization = useAuthorization()
  const { user: sessionUser } = useUser()
  const canManageMemberships = authorization.canManageUserMemberships()

  const { data: user, isLoading, isError, error } = useQuery(trpc.user.get.queryOptions(id))

  const basePath = `/brukere/${id}`

  const navItems: ResourceDetailNavItem[] = useMemo(() => {
    const items: ResourceDetailNavItem[] = [
      {
        href: basePath,
        label: "Info",
        icon: IconBuildingWarehouse,
      },
      {
        href: `${basePath}/medlemskap`,
        label: "Medlemskap",
        icon: IconCircles,
      },
      {
        href: `${basePath}/grupper`,
        label: "Grupper",
        icon: IconCampfire,
      },
      {
        href: `${basePath}/arrangementer`,
        label: "Arrangementer",
        icon: IconWheelchair,
      },
      {
        href: `${basePath}/prikker-og-suspensjoner`,
        label: "Prikker & Suspensjoner",
        icon: IconExclamationMark,
      },
    ]

    if (authorization.canAccessAuditLog()) {
      items.push({
        href: `${basePath}/hendelseslogg`,
        label: "Hendelseslogg",
        icon: IconClipboardList,
      })
    }

    return items
  }, [authorization, basePath])

  const readOnlyNotice = useMemo(() => {
    if (!user) {
      return undefined
    }

    const canEdit = authorization.canEditUserProfile(user.id, sessionUser?.sub ?? null)
    const decodedPath = decodeURIComponent(pathname)
    const isMedlemskapRoute =
      decodedPath === `${basePath}/medlemskap` || decodedPath.startsWith(`${basePath}/medlemskap/`)

    if (isMedlemskapRoute) {
      if (!canManageMemberships) {
        return {
          title: "Du kan ikke redigere medlemskap.",
          message: "Dette er fordi du ikke er administrator. Kontakt dotkom dersom du mener dette er en feil.",
        }
      }

      return undefined
    }

    if (!canEdit) {
      return {
        title: "Du kan ikke redigere denne brukerprofilen.",
        message: "Dette er fordi du kun kan redigere din egen profil.",
      }
    }

    return undefined
  }, [authorization, basePath, canManageMemberships, pathname, sessionUser?.sub, user])

  if (isLoading) {
    return null
  }

  if (isError || !user) {
    return (
      <ResourceDetailError
        backHref="/brukere"
        title="Feil ved henting av bruker"
        message={error?.message ?? (user === null ? `Bruker ${id} ble ikke funnet` : "Ukjent feil")}
      />
    )
  }

  const activeMembership = findActiveMembership(user)
  const grade = activeMembership?.semester != null ? getStudyGrade(activeMembership.semester) : null
  const membershipType = activeMembership ? getMembershipTypeName(activeMembership.type) : null

  const description = grade != null && membershipType != null ? `${grade}. klasse (${membershipType})` : undefined

  return (
    <ResourceDetailLayout
      title={user.name ?? user.email ?? user.id}
      description={description}
      backHref="/brukere"
      navItems={navItems}
      readOnlyNotice={readOnlyNotice}
      viewInWebProps={{
        label: "Se brukerprofil",
        href: new URL(`profil/${user.username}`, env.NEXT_PUBLIC_WEB_URL).toString(),
      }}
    >
      <UserDetailsContext.Provider value={{ user }}>{children}</UserDetailsContext.Provider>
    </ResourceDetailLayout>
  )
}
