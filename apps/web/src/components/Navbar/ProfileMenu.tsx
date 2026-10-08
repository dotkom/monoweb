"use client"

import { SessionRecoveryDropdown } from "@/components/auth/SessionRecoveryDropdown"
import { useIdentityLinkRequiresLogin } from "@/components/notices/identity-link-success-notice"
import { Link } from "@/components/link"
import type { AuthState } from "@/utils/authenticated-user-state"
import { useTRPC } from "@/utils/trpc/client"
import { useFullPathname } from "@/utils/use-full-pathname"
import type { UserRouter } from "@dotkomonline/rpc"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Text,
  Title,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@dotkomonline/ui"
import { createLogoutUrl, getSessionRecoveryMessages } from "@dotkomonline/utils"
import {
  IconAdjustments,
  IconArrowUpRight,
  IconBell,
  IconBug,
  IconLock,
  IconLogout2,
  IconMailForward,
  IconMessageReport,
  IconMoon,
  IconPalette,
  IconSettings,
  IconSun,
  IconUser,
} from "@tabler/icons-react"
import { skipToken, useQuery } from "@tanstack/react-query"
import { type ComponentType, type FC, Fragment, useState } from "react"
import { NotificationDropdown } from "./NotificationDropdown"
import { ThemeToggle } from "./ThemeToggle"
import { OnlineIcon } from "../atoms/OnlineIcon"
import { BugReportModal } from "../molecules/BugReport/BugReportModal"
import { GroupLogo } from "../atoms/GroupLogo"

const DEBUG_CONTACT_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScvjEqVsiRIYnVqCNqbH_-nmYk3Ux6la8a7KZzsY3sJDbW-iA/viewform"

const ThemeDropdown: FC = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-200 dark:hover:bg-stone-700">
        <IconSun width={22} height={22} className="dark:hidden" />
        <IconMoon width={22} height={22} className="hidden dark:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={24}
        positionMethod="fixed"
        className="w-fit -mr-3 rounded-xl border border-gray-300/70 bg-gray-50 p-2 shadow-md dark:border-stone-700 dark:bg-stone-800 sm:p-1.5"
      >
        <ThemeToggle />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const ContactDebugDropdown: FC = () => (
  <DropdownMenu>
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <DropdownMenuTrigger
          render={
            <Button
              variant="unstyled"
              aria-label="Kontakt debug, les mer om debug"
              className={cn(
                "transition-colors",
                "flex items-center justify-center size-10 rounded-full",
                "hover:bg-gray-200 dark:hover:bg-stone-700/50"
              )}
            >
              <IconMessageReport className="size-6" strokeWidth={1.6} />
            </Button>
          }
        />
      </TooltipTrigger>
      <TooltipContent>Opplevd noe ugreit?</TooltipContent>
    </Tooltip>

    <DropdownMenuContent
      align="end"
      className="w-[calc(100vw-2rem)] mx-2.75 xs:mx-0 xs:w-90 p-3 bg-background border border-gray-300/70 dark:border-stone-700 rounded-3xl shadow-md"
      sideOffset={24}
      positionMethod="fixed"
    >
      <div className="flex flex-col gap-3">
        <Title size="md" element="h3" className="px-3 pt-1.5 max-sm:hidden">
          Har du opplevd noe ugreit?
        </Title>
        <Title size="md" element="h3" className="px-3 pt-1.5 sm:hidden">
          Opplevd noe ugreit?
        </Title>

        <Link
          href="/grupper/debug"
          className={cn(
            "flex flex-row items-center gap-3 p-3 pl-1 rounded-xl transition-colors",
            "hover:bg-gray-50 dark:hover:bg-stone-700/25",
            "border border-transparent hover:border-gray-200 dark:hover:border-stone-700"
          )}
        >
          <GroupLogo
            src="/debug-logo.png"
            alt="Debug"
            width={42}
            height={42}
            containerClassName="rounded-full p-1.25"
          />

          <div className="flex flex-col gap-0">
            <Title element="p" size="md">
              Debug
            </Title>

            <Text className="text-sm text-muted-foreground">Onlines uavhengige varslingsorgan</Text>
          </div>
        </Link>

        <Text className="px-3 text-sm">
          Alle Debug-medlemmer har taushetsplikt, og alle innsendelser blir håndtert konfidensielt uten innsyn fra
          ledelsen i Online.
        </Text>

        <div className="flex flex-col gap-2 mt-3">
          <Button
            element={Link}
            variant="default"
            size="xl"
            href={DEBUG_CONTACT_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Text element="span">Ta kontakt med Debug</Text>
            <IconArrowUpRight className="size-5" />
          </Button>

          <Button
            element={Link}
            variant="ghost"
            href="/grupper/debug"
            rel="noopener noreferrer"
            className="w-fit hover:bg-gray-200 dark:hover:bg-stone-700"
          >
            Les mer om Debug
            <IconArrowUpRight className="size-4" />
          </Button>
        </div>
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
)

const UnauthenticatedActions: FC = () => {
  return (
    <div className="flex items-center">
      <NotificationDropdown isAuthenticated={false} />
      <ContactDebugDropdown />
      <ThemeDropdown />
    </div>
  )
}

interface LinkDetail {
  label: string
  icon: ComponentType<{ className?: string }>
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
        icon: IconBell,
        label: "Varslinger",
        href: "/varslinger",
      },
      {
        icon: IconSettings,
        label: "Innstillinger",
        href: "/innstillinger/bruker",
      },
    ],
  },
  {
    id: "admin",
    links: [
      {
        icon: IconAdjustments,
        label: "Adminside",
        href: "/admin",
        openInNewTab: true,
        adminOnly: true,
      },
      {
        icon: OnlineIcon,
        label: "Komitéwiki",
        href: "https://spurious-lynx-a5d.notion.site/hjem-b22d657f3c8143ee842f8810cafef1cb",
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
    ],
  },
]

export const ProfileMenu: FC<{ authState: AuthState }> = ({ authState }) => {
  const fullPathname = useFullPathname()
  const identityLinkRequiresLogin = useIdentityLinkRequiresLogin()
  const { sessionUser, isLoading, isInvalid, isSessionInvalid, isMissingDbUser, isDbUserFetchError, dbUser } = authState

  if (isLoading) {
    return null
  }

  if (sessionUser === null || sessionUser === undefined || identityLinkRequiresLogin) {
    return <UnauthenticatedActions />
  }

  const sessionRecoveryMessages = getSessionRecoveryMessages(isSessionInvalid, isMissingDbUser, isDbUserFetchError)

  if (isInvalid && sessionRecoveryMessages !== null) {
    return (
      <div className="flex gap-2.5">
        <div className="flex gap-0.5">
          <ContactDebugDropdown />
          <NotificationDropdown isAuthenticated={false} />
        </div>
        <SessionRecoveryDropdown {...sessionRecoveryMessages} returnTo={fullPathname} />
      </div>
    )
  }

  return (
    <div className="flex gap-2.5">
      <div className="flex gap-0.5">
        <ContactDebugDropdown />
        <NotificationDropdown isAuthenticated />
      </div>
      <AvatarDropdown dbUser={dbUser} />
    </div>
  )
}

type AvatarDropdownProps = {
  dbUser: UserRouter.GetMeOutput | null
}

export const AvatarDropdown: FC<AvatarDropdownProps> = ({ dbUser }) => {
  const [open, setOpen] = useState(false)
  const [isBugReportModalOpen, setBugReportModalOpen] = useState(false)
  const trpc = useTRPC()

  const isStaffResponse = useQuery({
    ...trpc.user.isStaff.queryOptions(),
    enabled: dbUser !== null,
  })

  const user = dbUser
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
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Åpne profilmeny"
            className="relative rounded-full transition-all duration-200 focus:outline-none"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.imageUrl ?? undefined} alt={user?.name ?? "Profilbilde"} />
              <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-800 dark:from-blue-400 dark:to-blue-800 text-white">
                <IconUser className="size-5" />
              </AvatarFallback>
            </Avatar>
            {showFeedbackFormPing && !open && (
              <span className="absolute top-0 right-0 size-3 rounded-full bg-red-500" />
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[calc(100vw-2rem)] mx-2.75 xs:w-72 xs:-mr-3 rounded-3xl p-3 bg-gray-50 dark:bg-stone-800 border border-gray-300/70 dark:border-stone-700 shadow-md"
          sideOffset={24}
          positionMethod="fixed"
        >
          <DropdownMenuLabel className="font-normal p-3 mb-2">
            <div className="flex flex-col min-w-0 flex-1">
              <Text className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user?.name || "Bruker"}
              </Text>
              <Text className="text-xs text-gray-600 dark:text-stone-400 truncate">{user?.email || ""}</Text>
            </div>
          </DropdownMenuLabel>

          {filteredLinkGroups.map((group, i, { length }) => {
            const notLast = i !== length - 1
            const allLinksAdminOnly = group.links.every((link) => link.adminOnly)

            return (
              <Fragment key={group.id}>
                {allLinksAdminOnly && (
                  <div className="flex items-center gap-3 px-[calc(--spacing(3)+1px)] py-1 mb-1 bg-amber-100 dark:bg-amber-900 rounded-md">
                    <div className="w-5 flex items-center justify-center">
                      <IconLock className="size-3.5 text-amber-700 dark:text-amber-300" />
                    </div>

                    <Text className="text-xs font-medium text-amber-700 dark:text-amber-300">Admin</Text>
                  </div>
                )}

                <DropdownMenuGroup className="space-y-1">
                  {group.links.map((link) => {
                    const isProfile = link.href === "/profil"
                    const IconComponent = link.icon

                    return (
                      <DropdownMenuItem
                        asChild
                        variant="uncolored"
                        onClick={() => setOpen(false)}
                        key={link.label}
                        className={cn(
                          "rounded-lg transition-colors cursor-pointer",
                          "hover:bg-gray-100 focus:bg-gray-100 data-highlighted:bg-gray-100",
                          "dark:hover:bg-stone-700/25 dark:focus:bg-stone-700/25 dark:data-highlighted:bg-stone-700/25",
                          "border border-transparent hover:border-gray-200 dark:hover:border-stone-700"
                        )}
                      >
                        <Link
                          className="flex items-center gap-3 min-h-9 px-3"
                          href={link.href ?? "#"}
                          target={link.openInNewTab ? "_blank" : undefined}
                          rel="noreferrer"
                        >
                          <IconComponent className="size-5 shrink-0 text-gray-600 dark:text-stone-300" />

                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-row gap-2 items-center">
                              <Text className="text-sm font-medium text-gray-900 dark:text-white">{link.label}</Text>
                              {showFeedbackFormPing && open && isProfile && (
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                              )}
                            </div>

                            {link.adminOnly && !allLinksAdminOnly && (
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

                {notLast && <DropdownMenuSeparator className="my-2.5 mx-2 bg-gray-300 dark:bg-stone-700" />}
              </Fragment>
            )
          })}

          <DropdownMenuItem
            asChild
            onClick={() => setBugReportModalOpen(true)}
            variant="uncolored"
            className={cn(
              "rounded-lg transition-colors cursor-pointer",
              "hover:bg-gray-100 focus:bg-gray-100 data-highlighted:bg-gray-100",
              "dark:hover:bg-stone-700/25 dark:focus:bg-stone-700/25 dark:data-highlighted:bg-stone-700/25",
              "border border-transparent hover:border-gray-200 dark:hover:border-stone-700"
            )}
          >
            <div className="flex items-center w-full ml-px gap-3 text-sm py-2">
              <IconBug className="size-5 shrink-0" />
              <Text className="text-sm font-medium">Rapporter en feil</Text>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-2.5 mx-2 bg-gray-300 dark:bg-stone-700" />

          <div className="flex items-center justify-between px-3">
            <div className="flex gap-3 items-center">
              <IconPalette className="size-5 shrink-0 text-gray-600 dark:text-stone-300" />
              <Text className="text-sm font-medium text-gray-900 dark:text-stone-100">Fargetema</Text>
            </div>
            <div>
              <ThemeToggle />
            </div>
          </div>

          <DropdownMenuSeparator className="my-2.5 mx-2 bg-gray-300 dark:bg-stone-700" />

          <DropdownMenuItem
            asChild
            onClick={() => setOpen(false)}
            variant="destructive"
            className="rounded-lg cursor-pointer px-3"
          >
            <a href={createLogoutUrl()} className="flex items-center w-full gap-3 text-sm py-2">
              <IconLogout2 className="size-5" />
              <Text className="text-sm font-medium">Logg ut</Text>
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <BugReportModal open={isBugReportModalOpen} setOpen={setBugReportModalOpen} />
    </>
  )
}
