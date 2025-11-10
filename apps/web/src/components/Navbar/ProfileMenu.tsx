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
  Text,
  Title,
} from "@dotkomonline/ui"
import { createAuthorizeUrl, createLogoutUrl } from "@dotkomonline/utils"
import type { Icon } from "@tabler/icons-react"
import {
  IconAdjustments,
  IconArrowUpRight,
  IconBug,
  IconDotsVertical,
  IconLock,
  IconLogin2,
  IconLogout2,
  IconMailForward,
  IconMessageReport,
  IconMoon,
  IconPalette,
  IconSettings,
  IconSun,
  IconUser,
} from "@tabler/icons-react"
import { skipToken, useQueries, useQuery } from "@tanstack/react-query"
import { useTheme } from "next-themes"
import Link from "next/link"
import { type FC, Fragment, useEffect, useState } from "react"
import { ThemeToggle } from "./ThemeToggle"

const DEBUG_CONTACT_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScvjEqVsiRIYnVqCNqbH_-nmYk3Ux6la8a7KZzsY3sJDbW-iA/viewform"

const getThemeIcon = (theme: string | undefined, resolvedTheme: string | undefined): Icon => {
  if (theme === "system") {
    return resolvedTheme === "dark" ? IconMoon : IconSun
  }
  return theme === "dark" ? IconMoon : IconSun
}

const ThemeDropdown: FC = () => {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const ThemeIcon = mounted ? getThemeIcon(theme, resolvedTheme) : IconSun

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-blue-200 dark:hover:bg-stone-700 transition-colors">
        <ThemeIcon width={22} height={22} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="-mr-1 lg:-mr-3 p-1 min-w-10 rounded-2xl bg-blue-50 dark:bg-stone-800 border border-blue-100 dark:border-stone-700 shadow-sm"
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
      <IconMessageReport width={24} height={24} />
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      className="w-[calc(100vw-2rem)] mx-4 xs:w-80 xs:ml-4 xs:mr-0 p-6 bg-blue-50 dark:bg-stone-800 border border-blue-100 dark:border-stone-700 rounded-3xl shadow-sm"
      sideOffset={24}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <IconMessageReport width={24} height={24} />
          <Title size="md" className="font-semibold text-gray-900 dark:text-white">
            Opplevd noe ugreit?
          </Title>
        </div>
        <Text className="text-sm px-1 text-gray-700 dark:text-stone-200">
          Her kan du ta kontakt med Debug. De har taushetsplikt, og alle innsendelser blir håndtert konfidensielt uten
          innsyn fra ledelsen i Online.
        </Text>
        <div className="flex flex-col gap-2">
          <Button
            element={Link}
            variant="unstyled"
            href={DEBUG_CONTACT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-lg bg-blue-100 dark:bg-stone-700 hover:bg-blue-200 dark:hover:bg-stone-600 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-stone-100">Ta kontakt</span>
            <IconArrowUpRight width={16} height={16} />
          </Button>
          <Button
            element={Link}
            variant="text"
            href="/grupper/debug"
            rel="noopener noreferrer"
            className="w-fit text-gray-600 dark:text-stone-300"
          >
            <span className="text-sm">Les mer om Debug</span>
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
        <IconDotsVertical className="" width={22} height={22} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="rounded-2xl p-2 bg-blue-50 dark:bg-stone-800 border border-blue-100 dark:border-stone-700 shadow-sm"
        sideOffset={24}
      >
        <Link
          className="flex items-center font-semibold text-sm px-3 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-stone-700 transition-colors"
          href={createAuthorizeUrl({ redirectAfter: fullPathname })}
          prefetch={false}
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
          prefetch={false}
          icon={<IconLogin2 className="mr-1 text-xl" />}
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
  icon: Icon
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
        icon: IconUser,
        label: "Min profil",
        href: "/profil",
      },
      {
        icon: IconSettings,
        label: "Innstillinger",
        href: "/innstillinger/profil",
      },
    ],
  },
  {
    id: "admin",
    links: [
      {
        icon: IconAdjustments,
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
        icon: IconMailForward,
        label: "Kontakt oss",
        href: "mailto:hovedstyret@online.ntnu.no",
        openInNewTab: true,
      },
      {
        icon: IconBug,
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
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-800 text-white">
              <IconUser className="size-5" />
            </AvatarFallback>
          </Avatar>
          {showFeedbackFormPing && !open && <span className="absolute top-0 right-0 size-3 rounded-full bg-red-500" />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[calc(100vw-2rem)] mx-4 xs:ml-4 xs:w-72 xs:-mr-16 lg:-mr-4 rounded-3xl p-3 bg-blue-50 dark:bg-stone-800 border border-blue-100 dark:border-stone-700 shadow-sm"
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
                        className="flex items-center gap-3"
                        href={link.href ?? "#"}
                        target={link.openInNewTab ? "_blank" : undefined}
                        rel="noreferrer"
                      >
                        {(() => {
                          const IconComponent = link.icon
                          return <IconComponent className="size-5 shrink-0 text-gray-600 dark:text-stone-300" />
                        })()}
                        <div className="flex items-center justify-between w-full">
                          <div className="flex flex-row gap-2 items-center">
                            <Text className="text-sm font-medium text-gray-900 dark:text-white">{link.label}</Text>
                            {showFeedbackFormPing && open && isProfile && (
                              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                            )}
                          </div>
                          {link.adminOnly && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900 rounded-full">
                              <IconLock className="size-3 text-amber-700 dark:text-amber-300" />
                              <Text className="text-xs font-medium text-amber-700 dark:text-amber-300">Admin</Text>
                            </div>
                          )}
                        </div>
                        {link.openInNewTab && (
                          <IconArrowUpRight className="size-5 shrink-0 text-gray-400 dark:text-stone-400" />
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
            <IconPalette className="size-5 text-gray-600 dark:text-stone-300" />
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
            <IconLogout2 className="size-5 text-red-500" />
            <Text className="font-medium text-red-500">Logg ut</Text>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
