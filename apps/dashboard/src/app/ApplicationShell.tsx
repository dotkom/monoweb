"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { BreadcrumbTrail } from "@/components/BreadcrumbTrail"
import { CommandPalette } from "@/components/molecules/CommandPalette/CommandPalette"
import { BreadcrumbProvider } from "@/lib/breadcrumb-context"
import { env } from "@/lib/env"
import { filterNavigationGroupsUserHasAccessTo, navigationGroups, type Navigation } from "@/lib/navigation"
import { setNavigationGroupsCollapsedCookie } from "@/lib/navigation-group-cookie"
import { useAuthenticatedUser } from "@/lib/use-authenticated-user"
import {
  Alert,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Text,
  Title,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  cn,
} from "@dotkomonline/ui"
import { createAuthorizeUrl, createLogoutUrl, getSessionRecoveryMessages, toAbsoluteUrl } from "@dotkomonline/utils"
import {
  IconChevronDown,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconMenu2,
  IconMoon,
  IconSun,
  IconX,
  type Icon as TablerIcon,
} from "@tabler/icons-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Fragment, useEffect, useState, type FC } from "react"

type Theme = "light" | "dark" | "system"

const THEME_OPTIONS = [
  { key: "light", theme: "light", label: "Lyst tema", icon: IconSun },
  { key: "dark", theme: "dark", label: "Mørkt tema", icon: IconMoon },
  {
    key: "system-desktop",
    theme: "system",
    label: "Systempreferanse",
    icon: IconDeviceDesktop,
    className: "hidden sm:flex",
  },
  {
    key: "system-mobile",
    theme: "system",
    label: "Systempreferanse",
    icon: IconDeviceMobile,
    className: "sm:hidden",
  },
] satisfies Array<{ key: string; theme: Theme; label: string; icon: TablerIcon; className?: string }>

function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const selected = mounted ? (theme ?? "system") : "system"

  return (
    <ToggleGroup
      multiple={false}
      spacing={0.5}
      value={[selected]}
      onValueChange={(value) => {
        setTheme(value.at(0) ?? "system")
      }}
    >
      {THEME_OPTIONS.map((item) => {
        const IconComponent = item.icon
        return (
          <Tooltip key={item.key}>
            <TooltipTrigger asChild>
              <ToggleGroupItem value={item.theme} size="lg" variant="default" className={cn("p-0.5", item.className)}>
                <IconComponent className="size-4.5 shrink-0" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>{item.label}</TooltipContent>
          </Tooltip>
        )
      })}
    </ToggleGroup>
  )
}

interface ApplicationShellProps {
  children: React.ReactNode
  isMac: boolean
  collapsedNavigationGroups: string[]
}

function NavigationItems({ items, pathname }: { items: Navigation[]; pathname: string }) {
  return items.map((navigation) => {
    const Icon = navigation.icon
    const active = !navigation.openInNewTab && pathname.startsWith(navigation.href)
    const className = cn(
      "flex items-center gap-2 rounded-lg p-2 text-sm no-underline",
      active ? "bg-muted font-medium" : "hover:bg-muted"
    )

    if (navigation.openInNewTab) {
      return (
        <a
          key={navigation.label}
          href={navigation.href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          <Icon className="size-4.5 shrink-0" />
          {navigation.label}
        </a>
      )
    }

    return (
      <Link key={navigation.label} href={navigation.href} className={className}>
        <Icon className="size-4.5 shrink-0" />
        {navigation.label}
      </Link>
    )
  })
}

export const ApplicationShell: FC<ApplicationShellProps> = ({ children, isMac, collapsedNavigationGroups }) => {
  const authorization = useAuthorization()
  const [mobileOpened, setMobileOpened] = useState(false)
  const [desktopOpened, setDesktopOpened] = useState(true)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => new Set(collapsedNavigationGroups))
  const pathname = usePathname()
  const {
    isLoading: authLoading,
    isInvalid,
    isSessionInvalid,
    isMissingDbUser,
    isDbUserFetchError,
  } = useAuthenticatedUser()

  const sessionRecoveryMessages = getSessionRecoveryMessages(isSessionInvalid, isMissingDbUser, isDbUserFetchError)
  const showSessionRecovery = !authLoading && isInvalid && sessionRecoveryMessages !== null
  const returnTo = toAbsoluteUrl(env.NEXT_PUBLIC_ORIGIN, pathname)
  const visibleNavigationGroups = filterNavigationGroupsUserHasAccessTo(navigationGroups, authorization)

  function setNavigationGroupOpen(label: string, open: boolean) {
    setCollapsedGroups((current) => {
      const next = new Set(current)

      if (open) {
        next.delete(label)
      } else {
        next.add(label)
      }

      setNavigationGroupsCollapsedCookie([...next])
      return next
    })
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is needed to close the mobile menu
  useEffect(() => {
    setMobileOpened(false)
  }, [pathname])

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-background text-foreground">
      <header className="flex h-15 shrink-0 items-center justify-between gap-3 border-b bg-background px-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9 md:hidden"
            aria-label={mobileOpened ? "Lukk meny" : "Åpne meny"}
            onClick={() => setMobileOpened((open) => !open)}
          >
            {mobileOpened ? <IconX className="size-4.5 shrink-0" /> : <IconMenu2 className="size-4.5 shrink-0" />}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9 hidden md:inline-flex"
            aria-label={desktopOpened ? "Skjul meny" : "Vis meny"}
            onClick={() => setDesktopOpened((open) => !open)}
          >
            {desktopOpened ? <IconX className="size-4.5 shrink-0" /> : <IconMenu2 className="size-4.5 shrink-0" />}
          </Button>
          <Title element="h1" size="md" className="truncate hidden sm:block">
            OnlineWeb dashboard
          </Title>
        </div>

        <CommandPalette isMac={isMac} />

        <div className="hidden items-center gap-2 md:flex">
          {showSessionRecovery ? (
            <>
              <Button element="a" variant="default" href={createAuthorizeUrl({ returnTo })}>
                Logg inn på nytt
              </Button>
              <Button element="a" variant="outline" href={createLogoutUrl({ returnTo })}>
                Logg ut
              </Button>
            </>
          ) : (
            <>
              <ThemeToggle />
              <Button element="a" variant="outline" href="/api/auth/logout">
                Logg ut
              </Button>
            </>
          )}
        </div>
      </header>

      <BreadcrumbProvider>
        <div className="flex min-h-0 flex-1">
          {mobileOpened ? (
            <button
              type="button"
              className="fixed top-15 right-0 bottom-0 left-0 z-30 bg-black/40 md:hidden"
              aria-label="Lukk meny"
              onClick={() => setMobileOpened(false)}
            />
          ) : null}

          <aside
            className={cn(
              "fixed top-15 bottom-0 left-0 z-40 w-72 shrink-0 flex-col gap-1 overflow-y-auto border-r bg-background p-4",
              "md:static md:inset-auto md:z-auto",
              mobileOpened ? "flex" : "hidden",
              desktopOpened ? "md:flex" : "md:hidden"
            )}
          >
            {visibleNavigationGroups.map((group, groupIndex) => {
              const groupKey = group.label ?? group.items[0]?.href ?? String(groupIndex)

              if (group.label) {
                const groupLabel = group.label
                const isOpen = !collapsedGroups.has(groupLabel)

                return (
                  <Collapsible
                    key={groupKey}
                    open={isOpen}
                    onOpenChange={(open) => setNavigationGroupOpen(groupLabel, open)}
                    className={cn(groupIndex > 0 && "mt-4")}
                  >
                    <CollapsibleTrigger
                      className={cn(
                        "mb-1 flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1 text-left hover:bg-muted",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      )}
                      aria-label={isOpen ? `Skjul ${group.label}` : `Vis ${group.label}`}
                    >
                      <Text className="text-xs font-medium text-muted-foreground">{group.label}</Text>
                      <IconChevronDown className="size-4 shrink-0 text-muted-foreground" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <NavigationItems items={group.items} pathname={pathname} />
                    </CollapsibleContent>
                  </Collapsible>
                )
              }

              return (
                <Fragment key={groupKey}>
                  <NavigationItems items={group.items} pathname={pathname} />
                </Fragment>
              )
            })}

            <div className="mt-6 flex flex-col gap-2 md:hidden">
              <ThemeToggle />
              {showSessionRecovery ? (
                <>
                  <Button element="a" variant="default" href={createAuthorizeUrl({ returnTo })}>
                    Logg inn på nytt
                  </Button>
                  <Button element="a" variant="outline" href={createLogoutUrl({ returnTo })}>
                    Logg ut
                  </Button>
                </>
              ) : (
                <Button element="a" variant="outline" href="/api/auth/logout">
                  Logg ut
                </Button>
              )}
            </div>
          </aside>

          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 pb-4">
            <div className="pt-4">
              {showSessionRecovery && sessionRecoveryMessages !== null ? (
                <Alert status="danger" title={sessionRecoveryMessages.title} className="mb-6">
                  <Text size="sm">{sessionRecoveryMessages.description}</Text>
                  <div className="mt-3 flex gap-2">
                    <Button element="a" size="sm" variant="default" href={createAuthorizeUrl({ returnTo })}>
                      Logg inn på nytt
                    </Button>
                    <Button element="a" size="sm" variant="outline" href={createLogoutUrl({ returnTo })}>
                      Logg ut
                    </Button>
                  </div>
                </Alert>
              ) : null}

              <BreadcrumbTrail />
            </div>

            {children}
          </main>
        </div>
      </BreadcrumbProvider>
    </div>
  )
}
