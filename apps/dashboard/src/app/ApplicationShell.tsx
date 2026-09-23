"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { env } from "@/lib/env"
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
  IconAward,
  IconBan,
  IconBell,
  IconBriefcase,
  IconCampfire,
  IconClipboardList,
  IconConfetti,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconMenu2,
  IconMoneybag,
  IconMoon,
  IconPhoto,
  IconPhotoShare,
  IconSkull,
  IconSun,
  IconUserMinus,
  IconUsersGroup,
  IconWheelchair,
  IconX,
  type Icon as TablerIcon,
} from "@tabler/icons-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Fragment, type FC, useEffect, useState } from "react"
import { z } from "zod"

const navigations = [
  {
    label: "Arrangementer",
    icon: IconWheelchair,
    href: "/arrangementer",
  },
  {
    label: "Varslinger",
    icon: IconBell,
    href: "/varslinger",
  },
  {
    label: "Grupper",
    icon: IconCampfire,
    href: "/grupper",
  },
  {
    label: "Prikker og suspensjoner",
    icon: IconBan,
    href: "/prikker",
  },
  {
    label: "Jobbutlysninger",
    icon: IconBriefcase,
    href: "/karriere",
  },
  {
    label: "Konkurranser",
    icon: IconAward,
    href: "/konkurranser",
  },
  {
    label: "Artikler",
    icon: IconPhoto,
    href: "/artikler",
  },
  {
    label: "Offline",
    icon: IconSkull,
    href: "/offline",
    canAccess: (authorization: ReturnType<typeof useAuthorization>) => authorization.canEditOffline(),
  },
  { label: "Bedrifter", icon: IconMoneybag, href: "/bedrifter" },
  {
    label: "Fadderukene",
    icon: IconConfetti,
    href: "/fadderukene",
    canAccess: (authorization: ReturnType<typeof useAuthorization>) => authorization.canEditFadderuke(),
  },
  { label: "Avmeldingsgrunner", icon: IconUserMinus, href: "/avmeldingsgrunner" },
  { label: "Brukere", icon: IconUsersGroup, href: "/brukere" },
  {
    label: "Plakatbestilling",
    icon: IconPhotoShare,
    href: "https://fern-smelt-8a2.notion.site/1c7ae7670a5180f2ada1c29699a1f44f",
    openInNewTab: true,
  },
  {
    label: "Hendelseslogg",
    icon: IconClipboardList,
    href: "/logg",
    canAccess: (authorization: ReturnType<typeof useAuthorization>) => authorization.canAccessAuditLog(),
  },
] satisfies {
  label: string
  icon: TablerIcon
  href: string
  openInNewTab?: boolean
  canAccess?: (authorization: ReturnType<typeof useAuthorization>) => boolean
}[]

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

  return (
    <ToggleGroup
      multiple={false}
      spacing={0.5}
      value={[theme ?? "system"]}
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
}

export const ApplicationShell: FC<ApplicationShellProps> = ({ children }) => {
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
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 flex h-[60px] items-center justify-between gap-3 border-b bg-background px-4">
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
          <Title element="h1" size="md" className="truncate">
            OnlineWeb dashboard
          </Title>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
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

          <div className="mt-6 flex flex-col gap-2 sm:hidden">
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

        <main className="min-w-0 flex-1 p-4">
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

          {children}
        </main>
      </div>
    </div>
  )
}
