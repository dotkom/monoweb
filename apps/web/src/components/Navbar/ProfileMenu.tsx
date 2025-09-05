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
} from "@dotkomonline/ui"
import { createAuthorizeUrl, createLogoutUrl } from "@dotkomonline/utils"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { type FC, Fragment, type PropsWithChildren, useState } from "react"
import { ThemeToggle } from "./ThemeToggle"

export const ProfileMenu: FC = () => {
  const session = useSession()
  const fullPathname = useFullPathname()
  const trpc = useTRPC()
  const { data: user } = useQuery(trpc.user.getMe.queryOptions(undefined, { enabled: Boolean(session) }))

  if (session === null) {
    return (
      <div className="flex flex-row gap-2">
        <Button
          element={Link}
          variant="solid"
          size="sm"
          color="brand"
          className="text-sm font-semibold px-3 py-2"
          href={createAuthorizeUrl({ connection: "FEIDE", redirectAfter: fullPathname })}
          icon={<Icon className="md:hidden lg:flex mr-2 text-xl" icon="tabler:login-2" />}
        >
          Logg inn
        </Button>

        <div className="hidden md:block">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-blue-200 dark:hover:bg-stone-700 transition-colors">
              <Icon icon="tabler:dots" className="rotate-90" width={24} height={24} />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="-mr-3 px-4 py-3 rounded-3xl mt-2 bg-blue-50 dark:bg-stone-800 border border-blue-100 dark:border-stone-700/30 shadow-sm rounded-lg"
              sideOffset={16}
            >
              <div className="gap-2 flex">
                <ThemeToggle size="sm" className="" classNameSlider="bg-white dark:bg-stone-600" />

                <div className="h-10 w-1 bg-gray-300 dark:bg-stone-600" />

                <Button
                  element={Link}
                  variant="solid"
                  size="md"
                  className="w-full font-semibold justify-start px-3 h-10 bg-transparent dark:bg-transparent hover:bg-blue-100 dark:hover:bg-stone-700 transition-none"
                  href={createAuthorizeUrl({ redirectAfter: fullPathname })}
                >
                  Logg inn uten Feide
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
  }

  return (
    <AvatarDropdown>
      <button
        type="button"
        aria-label="Åpne profilmeny"
        className="rounded-full transition-all duration-200 focus:outline-none"
      >
        <Avatar className="h-10 w-10">
          <AvatarImage src={user?.imageUrl ?? undefined} alt={user?.name ?? "Profilbilde"} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-medium">
            <Icon className="text-lg" icon="tabler:user" />
          </AvatarFallback>
        </Avatar>
      </button>
    </AvatarDropdown>
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
        icon: "tabler:spy",
        label: "Opplevd noe ugreit?",
        href: "https://docs.google.com/forms/d/e/1FAIpQLScvjEqVsiRIYnVqCNqbH_-nmYk3Ux6la8a7KZzsY3sJDbW-iA/viewform",
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

export const AvatarDropdown: FC<PropsWithChildren> = ({ children }) => {
  const [open, setOpen] = useState(false)

  const session = useSession()
  const trpc = useTRPC()
  const fullPathname = useFullPathname()

  const { data: user } = useQuery(trpc.user.getMe.queryOptions(undefined, { enabled: Boolean(session) }))
  const { data: isStaff } = useQuery(trpc.user.isStaff.queryOptions(undefined, { enabled: Boolean(session) }))

  const filteredLinkGroups = linkGroups
    .map((group) => ({
      ...group,
      links: group.links.filter((link) => !link.adminOnly || isStaff),
    }))
    .filter((group) => group.links.length > 0)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-72 -mr-16 md:-mr-3 mt-3 rounded-3xl p-3 bg-blue-50 dark:bg-stone-800 border border-blue-100 dark:border-stone-700/30 shadow-sm"
        sideOffset={8}
      >
        <DropdownMenuLabel className="font-normal p-3 mb-2">
          <div className="flex flex-col min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name || "Bruker"}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{user?.email || ""}</p>
          </div>
        </DropdownMenuLabel>

        {filteredLinkGroups.map((group, i, { length }) => {
          const notLast = i !== length - 1

          return (
            <Fragment key={group.id}>
              <DropdownMenuGroup className="space-y-1">
                {group.links.map((link) => (
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
                      {link.adminOnly ? (
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium text-gray-900 dark:text-white">{link.label}</span>
                          <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900 rounded-full">
                            <Icon
                              icon="tabler:lock"
                              width={12}
                              height={12}
                              className="text-amber-700 dark:text-amber-300"
                            />
                            <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Admin</span>
                          </div>
                        </div>
                      ) : (
                        <span className="font-medium text-gray-900 dark:text-white">{link.label}</span>
                      )}
                      {link.openInNewTab && (
                        <Icon icon="tabler:arrow-up-right" width={16} height={16} className="text-gray-400 ml-auto" />
                      )}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              {notLast && <DropdownMenuSeparator className="my-2 bg-gray-300 dark:bg-stone-700" />}
            </Fragment>
          )
        })}

        <DropdownMenuSeparator className="my-2 bg-gray-300 dark:bg-stone-700" />

        <div className="flex items-center justify-between px-3">
          <div className="flex gap-3 items-center">
            <Icon icon={"tabler:palette"} width={16} height={16} className="text-gray-600 dark:text-stone-300" />
            <span className="text-sm font-medium text-gray-900 dark:text-stone-100">Fargetema</span>
          </div>
          <ThemeToggle size="sm" className="" classNameSlider="bg-white dark:bg-stone-600" />
        </div>

        <DropdownMenuSeparator className="my-2 bg-gray-300 dark:bg-stone-700" />

        <DropdownMenuItem className="rounded-lg hover:bg-blue-100 focus:bg-blue-100 dark:hover:bg-stone-700 dark:focus:bg-stone-700 transition-colors cursor-pointer">
          <Link
            href={createLogoutUrl({ redirectAfter: fullPathname })}
            className="flex items-center w-full gap-3 text-sm"
          >
            <Icon icon="tabler:logout-2" width={16} height={16} className="text-red-500" />
            <span className="font-medium text-red-500">Logg ut</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
