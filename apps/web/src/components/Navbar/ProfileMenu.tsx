"use client"

import { env } from "@/env"
import { useTRPC } from "@/utils/trpc/client"
import { useFullPathname } from "@/utils/use-full-pathname"
import { useSession } from "@dotkomonline/oauth2/react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
  Text,
  Title,
} from "@dotkomonline/ui"
import { createAuthorizeUrl, createLogoutUrl } from "@dotkomonline/utils"
import { skipToken, useQueries, useQuery } from "@tanstack/react-query"
import { useTheme } from "next-themes"
import Link from "next/link"
import { type FC, Fragment, useEffect, useState } from "react"
import { ThemeToggle } from "./ThemeToggle"

const getThemeIcon = (theme: string | undefined, resolvedTheme: string | undefined) => {
  if (theme === "system") {
    return resolvedTheme === "dark" ? "tabler:moon" : "tabler:sun"
  }
  return theme === "dark" ? "tabler:moon" : "tabler:sun"
}

const ThemeDropdown: FC = () => {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-blue-200 dark:hover:bg-stone-700 transition-colors">
        <Icon icon={mounted ? getThemeIcon(theme, resolvedTheme) : "tabler:sun"} width={22} height={22} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="-mr-2 lg:-mr-3 p-1 rounded-2xl bg-blue-50 dark:bg-stone-800 border border-blue-100 dark:border-stone-700 shadow-sm"
        sideOffset={24}
      >
        <ThemeToggle />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const ContactDebugDropdown: FC = () => (
  <DropdownMenu>
    <DropdownMenuTrigger className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-blue-200 dark:hover:bg-stone-700 transition-colors">
      <Icon icon="tabler:message-report" width={24} height={24} />
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      className="w-80 rounded-3xl ml-4 p-6 bg-blue-50 dark:bg-stone-800 border border-blue-100 dark:border-stone-700 shadow-sm"
      sideOffset={24}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Icon icon="tabler:message-report" width={24} height={24} />
          <Title className="font-semibold text-gray-900 dark:text-white">Opplevd noe ugreit?</Title>
        </div>
        <p className="text-sm px-1 text-gray-700 dark:text-stone-200 leading-relaxed">
          Her kan du ta kontakt med Debug. De har taushetsplikt, og alle innsendelser blir håndtert konfidensielt uten
          innsyn fra ledelsen i Online.
        </p>
        <div className="flex flex-col gap-2">
          <Button
            element={Link}
            variant="unstyled"
            href="https://docs.google.com/forms/d/e/1FAIpQLScvjEqVsiRIYnVqCNqbH_-nmYk3Ux6la8a7KZzsY3sJDbW-iA/viewform"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-lg bg-blue-100 dark:bg-stone-700 hover:bg-blue-200 dark:hover:bg-stone-600 transition-colors"
          >
            <Text className="font-medium text-gray-900 dark:text-stone-100">Ta kontakt</Text>
            <Icon icon="tabler:arrow-up-right" width={16} height={16} />
          </Button>
          <Button
            element={Link}
            variant="text"
            href="https://wiki.online.ntnu.no/historie/debug/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-fit gap-1"
          >
            <Text className="text-sm">Les mer om Debug</Text>
            <Icon icon="tabler:arrow-up-right" width={16} height={16} />
          </Button>
        </div>
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
)

const LoginAlternativesDropdown: FC = () => {
  const fullPathname = useFullPathname()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center justify-center w-6 h-10">
        <Icon icon="tabler:dots-vertical" className="" width={22} height={22} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="rounded-2xl p-2 bg-blue-50 dark:bg-stone-800 border border-blue-100 dark:border-stone-700 shadow-sm"
        sideOffset={24}
      >
        <Link
          className="flex items-center font-semibold text-sm px-3 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-stone-700 transition-colors"
          href={createAuthorizeUrl({ redirectAfter: fullPathname })}
        >
          Logg inn uten Feide
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const UnauthenticatedActions: FC = () => {
  const fullPathname = useFullPathname()
  return (
    <div className="flex items-center">
      <div className="flex mr-2">
        <Button
          element={Link}
          variant="solid"
          color="brand"
          className="text-sm font-semibold px-3 py-2"
          href={createAuthorizeUrl({ connection: "FEIDE", redirectAfter: fullPathname })}
          icon={<Icon className="mr-2 text-xl" icon="tabler:login-2" />}
        >
          Logg inn
        </Button>
        <div className="hidden lg:block">
          <LoginAlternativesDropdown />
        </div>
      </div>
      <ContactDebugDropdown />
      <ThemeDropdown />
    </div>
  )
}

interface LinkDetail {
  label: string
  icon: string
  href?: string
  openInNewTab?: boolean
  adminOnly?: boolean
}

interface LinkGroup {
  id: string
  links: LinkDetail[]
}

const linkGroups: LinkGroup[] = [
  {
    id: "profile",
    links: [
      {
        icon: "tabler:user",
        label: "Min profil",
        href: "/profil",
      },
      {
        icon: "tabler:settings",
        label: "Innstillinger",
        href: "/innstillinger/profil",
      },
    ],
  },
  {
    id: "admin",
    links: [
      {
        icon: "tabler:adjustments",
        label: "Dashboard",
        href: env.NEXT_PUBLIC_DASHBOARD_URL,
        openInNewTab: true,
        adminOnly: true,
      },
    ],
  },
  {
    id: "support",
    links: [
      {
        icon: "tabler:mail-forward",
        label: "Kontakt oss",
        href: "mailto:hovedstyret@online.ntnu.no",
        openInNewTab: true,
      },
      {
        icon: "tabler:bug",
        label: "Rapporter en feil",
        href: "mailto:dotkom@online.ntnu.no",
        openInNewTab: true,
      },
    ],
  },
]

export const ProfileMenu: FC = () => {
  const session = useSession()
  if (session === null) return <UnauthenticatedActions />
  return (
    <div className="flex gap-2 mr-2 lg:mr-0">
      <ContactDebugDropdown />
      <AvatarDropdown />
    </div>
  )
}

export const AvatarDropdown: FC = () => {
  const [open, setOpen] = useState(false)
  const session = useSession()
  const fullPathname = useFullPathname()
  const trpc = useTRPC()

  const [userResponse, isStaffResponse] = useQueries({
    queries: [
      trpc.user.getMe.queryOptions(undefined, { enabled: Boolean(session) }),
      trpc.user.isStaff.queryOptions(undefined, { enabled: Boolean(session) }),
    ],
  })

  const user = userResponse.data
  const isStaff = isStaffResponse.data ?? false

  const { data: eventsMissingFeedback } = useQuery(
    trpc.event.findUnansweredByUser.queryOptions(user?.id ?? skipToken, { enabled: Boolean(user) })
  )

  const filteredLinkGroups = linkGroups
    .map((group) => ({
      ...group,
      links: group.links.filter((link) => !link.adminOnly || isStaff),
    }))
    .filter((group) => group.links.length > 0)

  const showFeedbackFormPing = eventsMissingFeedback && eventsMissingFeedback.length > 0

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Åpne profilmeny"
          className="relative rounded-full transition-all duration-200 focus:outline-none"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.imageUrl ?? undefined} alt={user?.name ?? "Profilbilde"} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-medium">
              <Icon className="text-lg" icon="tabler:user" />
            </AvatarFallback>
          </Avatar>
          {showFeedbackFormPing && !open && <Text className="absolute top-0 right-0 w-3 h-3 rounded-full bg-red-500" />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-72 -mr-16 lg:-mr-4 rounded-3xl p-3 bg-blue-50 dark:bg-stone-800 border border-blue-100 dark:border-stone-700 shadow-sm"
        sideOffset={24}
      >
        <DropdownMenuLabel className="font-normal p-3 mb-2">
          <div className="flex flex-col min-w-0 flex-1">
            <Text className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {user?.name || "Bruker"}
            </Text>
            <Text className="text-xs text-gray-600 dark:text-gray-400 truncate">{user?.email || ""}</Text>
          </div>
        </DropdownMenuLabel>

        {filteredLinkGroups.map((group, i, { length }) => {
          const notLast = i !== length - 1

          return (
            <Fragment key={group.id}>
              <DropdownMenuGroup className="space-y-1">
                {group.links.map((link) => {
                  const isProfile = link.href === "/profil"

                  return (
                    <DropdownMenuItem
                      asChild
                      onClick={() => setOpen(false)}
                      key={link.label}
                      className="rounded-lg hover:bg-blue-100 focus:bg-blue-100 dark:hover:bg-stone-700 dark:focus:bg-stone-700 transition-colors cursor-pointer"
                    >
                      <Link
                        className="flex items-center gap-3 text-sm"
                        href={link.href ?? "#"}
                        target={link.openInNewTab ? "_blank" : undefined}
                        rel="noreferrer"
                      >
                        <Icon icon={link.icon} width={16} height={16} className="text-gray-600 dark:text-stone-300" />
                        <div className="flex items-center justify-between w-full">
                          <div className="flex flex-row gap-2 items-center">
                            <Text className="font-medium text-gray-900 dark:text-white">{link.label}</Text>
                            {showFeedbackFormPing && open && isProfile && (
                              <Text className="w-2.5 h-2.5 rounded-full bg-red-500" />
                            )}
                          </div>
                          {link.adminOnly && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900 rounded-full">
                              <Icon
                                icon="tabler:lock"
                                width={12}
                                height={12}
                                className="text-amber-700 dark:text-amber-300"
                              />
                              <Text className="text-xs font-medium text-amber-700 dark:text-amber-300">Admin</Text>
                            </div>
                          )}
                        </div>
                        {link.openInNewTab && (
                          <Icon icon="tabler:arrow-up-right" width={16} height={16} className="text-gray-400 ml-auto" />
                        )}
                      </Link>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuGroup>
              {notLast && <DropdownMenuSeparator className="my-2 bg-gray-300 dark:bg-stone-700" />}
            </Fragment>
          )
        })}

        <DropdownMenuSeparator className="my-2 bg-gray-300 dark:bg-stone-700" />

        <div className="flex items-center justify-between px-3">
          <div className="flex gap-3 items-center">
            <Icon icon="tabler:palette" width={16} height={16} className="text-gray-600 dark:text-stone-300" />
            <Text className="text-sm font-medium text-gray-900 dark:text-stone-100">Fargetema</Text>
          </div>
          <ThemeToggle />
        </div>

        <DropdownMenuSeparator className="my-2 bg-gray-300 dark:bg-stone-700" />

        <DropdownMenuItem className="rounded-lg hover:bg-blue-100 dark:hover:bg-stone-700 transition-colors cursor-pointer">
          <Link
            prefetch={false}
            href={createLogoutUrl({ redirectAfter: fullPathname })}
            className="flex items-center w-full gap-3 text-sm"
          >
            <Icon icon="tabler:logout-2" width={16} height={16} className="text-red-500" />
            <Text className="font-medium text-red-500">Logg ut</Text>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
