"use client"

import { useTRPC } from "@/utils/trpc/client"
import { useAuthenticatedUser } from "@/utils/use-authenticated-user"
import { useFeideLinkNudge } from "@/utils/use-feide-link-nudge"
import { Title } from "@dotkomonline/ui"
import { IconNotes, IconUser, IconUserCircle } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { SettingsMenuItem } from "./settings-menu-item"

export const settingsNavigationItems = [
  {
    slug: "/innstillinger/bruker",
    icon: IconUser,
    title: "Min bruker",
  },
  {
    slug: "/innstillinger/medlemskap",
    icon: IconNotes,
    title: "Medlemskap",
  },
  {
    slug: "/innstillinger/profil",
    icon: IconUserCircle,
    title: "Brukerprofil",
  },
]

export const ProfileNavigationMenu = () => {
  const trpc = useTRPC()
  const { sessionUser } = useAuthenticatedUser()

  const { data: auth0Connections, isLoading: auth0ConnectionsIsLoading } = useQuery({
    ...trpc.user.getAuth0Connections.queryOptions({ userId: sessionUser?.sub ?? "" }),
    enabled: sessionUser != null,
  })

  const { showNudge: showFeideLinkNudge } = useFeideLinkNudge({
    auth0Connections,
    auth0ConnectionsIsLoading,
  })

  return (
    <section className="flex flex-col min-w-40 w-1/6 h-full gap-3 max-md:hidden">
      <Title element="h1" className="text-base font-semibold text-muted-foreground">
        Innstillinger
      </Title>
      <div className="flex flex-col gap-2">
        {settingsNavigationItems.map((item) => (
          <SettingsMenuItem
            key={item.slug}
            {...item}
            showNotificationDot={showFeideLinkNudge && item.slug === "/innstillinger/bruker"}
          />
        ))}
      </div>
    </section>
  )
}
