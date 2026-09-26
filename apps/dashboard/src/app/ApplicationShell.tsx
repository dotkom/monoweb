"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { CommandPalette } from "@/components/molecules/CommandPalette/CommandPalette"
import { env } from "@/lib/env"
import { navigations } from "@/lib/navigation"
import { useAuthenticatedUser } from "@/lib/use-authenticated-user"
import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  Button,
  Text,
  Title,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  cn,
} from "@dotkomonline/ui"
import {
  capitalizeFirstLetter,
  createAuthorizeUrl,
  createLogoutUrl,
  getSessionRecoveryMessages,
  toAbsoluteUrl,
} from "@dotkomonline/utils"
import {
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
import { z } from "zod"

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
}

export const ApplicationShell: FC<ApplicationShellProps> = ({ children, isMac }) => {
  const authorization = useAuthorization()
  const [mobileOpened, setMobileOpened] = useState(false)
  const [desktopOpened, setDesktopOpened] = useState(true)
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
  const visibleNavigations = navigations.filter((navigation) => navigation.canAccess?.(authorization) ?? true)

  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is needed to close the mobile menu
  useEffect(() => {
    setMobileOpened(false)
  }, [pathname])

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-background text-foreground">
      <header className="flex h-[60px] shrink-0 items-center justify-between gap-3 border-b bg-background px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="md:hidden"
            aria-label={mobileOpened ? "Lukk meny" : "Åpne meny"}
            onClick={() => setMobileOpened((open) => !open)}
          >
            {mobileOpened ? <IconX /> : <IconMenu2 />}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="hidden md:inline-flex"
            aria-label={desktopOpened ? "Skjul meny" : "Vis meny"}
            onClick={() => setDesktopOpened((open) => !open)}
          >
            {desktopOpened ? <IconX /> : <IconMenu2 />}
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

      <div className="flex min-h-0 flex-1">
        {mobileOpened ? (
          <button
            type="button"
            className="fixed top-[60px] right-0 bottom-0 left-0 z-30 bg-black/40 md:hidden"
            aria-label="Lukk meny"
            onClick={() => setMobileOpened(false)}
          />
        ) : null}

        <aside
          className={cn(
            "fixed top-[60px] bottom-0 left-0 z-40 w-72 shrink-0 flex-col gap-1 overflow-y-auto border-r bg-background p-4",
            "md:static md:inset-auto md:z-auto",
            mobileOpened ? "flex" : "hidden",
            desktopOpened ? "md:flex" : "md:hidden"
          )}
        >
          {visibleNavigations.map((navigation) => {
            const Icon = navigation.icon
            const active = !navigation.openInNewTab && pathname.startsWith(navigation.href)
            const className = cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm no-underline",
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

            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink render={<Link href="/" />}>Hjem</BreadcrumbLink>
                </BreadcrumbItem>
                {pathname
                  .split("/")
                  .filter((part) => part.length > 0)
                  .map((part, index, parts) => {
                    const href = `/${parts.slice(0, index + 1).join("/")}`
                    const decodedPart = decodeURIComponent(part)
                    const isId = decodedPart.includes("|")
                    const isUuid = z.uuid().safeParse(decodedPart).success
                    const label = isId || isUuid ? decodedPart : capitalizeFirstLetter(decodedPart)

                    return (
                      <Fragment key={href}>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbLink render={<Link href={href} />}>{label}</BreadcrumbLink>
                        </BreadcrumbItem>
                      </Fragment>
                    )
                  })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {children}
        </main>
      </div>
    </div>
  )
}
