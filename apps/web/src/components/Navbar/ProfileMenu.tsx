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
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  Icon,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RadioGroup,
  RadioGroupItem,
  Text,
  cn,
} from "@dotkomonline/ui"
import { createAuthorizeUrl, createUnauthorizeUrl } from "@dotkomonline/utils"
import { useQuery } from "@tanstack/react-query"
import { useTheme } from "next-themes"
import Link from "next/link"
import { type FC, Fragment, type PropsWithChildren, useState } from "react"

const THEME_OPTIONS = [
  {
    theme: "light",
    label: "Lyst tema",
    icon: "tabler:sun",
  },
  {
    theme: "dark",
    label: "Mørkt tema",
    icon: "tabler:moon",
  },
  {
    theme: "system",
    label: "Systempreferanse",
    icon: "tabler:device-desktop",
  },
] as const

export const ProfileMenu: FC = () => {
  const session = useSession()
  const fullPathname = useFullPathname()
  const trpc = useTRPC()

  const { data: user } = useQuery(trpc.user.getMe.queryOptions(undefined, { enabled: Boolean(session) }))

  if (session === null) {
    const { setTheme, theme } = useTheme()

    return (
      <div className="flex flex-row gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="text" size="sm" className="text-sm font-semibold px-3 hover:bg-blue-200">
              <Icon icon="tabler:sun-moon" className="text-base" />
              Tema
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <RadioGroup defaultValue={theme} onValueChange={(val) => setTheme(val)} className="flex flex-col gap-2">
              {THEME_OPTIONS.map((item) => (
                <Label
                  key={item.theme}
                  htmlFor={item.theme}
                  className="flex flex-row items-center gap-2 p-2 w-full hover:bg-gray-200 dark:hover:bg-stone-700 rounded-md cursor-pointer"
                >
                  <RadioGroupItem value={item.theme} id={item.theme} className="hidden" />
                  <div
                    className={cn(
                      "w-1 h-4 rounded-full bg-gray-500 dark:bg-stone-500 invisible",
                      theme === item.theme && "visible"
                    )}
                  />
                  <Icon icon={item.icon} className="text-base dark:text-white" />
                  <Text className="dark:text-white">{item.label}</Text>
                </Label>
              ))}
            </RadioGroup>
          </PopoverContent>
        </Popover>

        <Button
          element="a"
          variant="solid"
          size="sm"
          color="brand"
          className="text-sm font-semibold px-3 py-2"
          href={createAuthorizeUrl({ connection: "FEIDE", redirectAfter: fullPathname })}
        >
          Logg inn
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center">
            <Icon icon="tabler:dots" className="rotate-90" width={28} height={28} />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <Button
              element="a"
              variant="solid"
              size="sm"
              color="white"
              className="text-sm font-semibold px-3 py-2"
              href={createAuthorizeUrl({ redirectAfter: fullPathname })}
            >
              Logg inn uten feide
            </Button>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <button type="button">
      <AvatarDropdown>
        <Avatar>
          <AvatarImage src={user?.imageUrl ?? undefined} alt={user?.name ?? "Profilbilde"} />
          <AvatarFallback className="bg-blue-500">
            <Icon className="text-lg" icon="tabler:user" />
          </AvatarFallback>
        </Avatar>
      </AvatarDropdown>
    </button>
  )
}

interface LinkDetail {
  label: string
  icon: string
  href?: string
  openInNewTab?: boolean
  adminOnly?: boolean
}
const linkGroups: LinkDetail[][] = [
  [
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
  [
    {
      icon: "tabler:adjustments",
      label: "Dashboard",
      href: env.NEXT_PUBLIC_DASHBOARD_URL,
      openInNewTab: true,
      adminOnly: true,
    },
  ],
  [
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
]

export const AvatarDropdown: FC<PropsWithChildren> = ({ children }) => {
  const [open, setOpen] = useState(false)

  const session = useSession()
  const trpc = useTRPC()
  const fullPathname = useFullPathname()

  const { data: isStaff } = useQuery(trpc.user.isStaff.queryOptions(undefined, { enabled: Boolean(session) }))

  const filteredLinkGroups = linkGroups
    .map((group) => group.filter((link) => !link.adminOnly || isStaff))
    .filter((group) => group.length > 0)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-60">
        {filteredLinkGroups.map((group, i, { length }) => {
          const notLast = i !== length - 1

          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: This is a static list
            <Fragment key={i}>
              <DropdownMenuGroup>
                {group.map((link) => (
                  <DropdownMenuItem asChild onClick={() => setOpen(false)} key={link.label}>
                    <Link
                      className="w-full flex flex-row gap-2 items-center"
                      href={link.href ?? "#"}
                      target={link.openInNewTab ? "_blank" : undefined}
                      rel="noreferrer"
                    >
                      <Icon icon={link.icon} className="text-sm" />
                      {link.adminOnly ? (
                        <div className="flex flex-row items-center justify-between w-full">
                          <Text element="span">{link.label}</Text>
                          <div className="flex flex-row items-center gap-1 text-[0.65rem] text-gray-800 dark:text-stone-400">
                            <Icon icon="tabler:lock" />
                            <Text element="span">Admin</Text>
                          </div>
                        </div>
                      ) : (
                        <Text element="span">{link.label}</Text>
                      )}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              {notLast && <DropdownMenuSeparator />}
            </Fragment>
          )
        })}

        <DropdownMenuSeparator />

        <ThemeMenuSub />

        <DropdownMenuSeparator />

        <DropdownMenuItem className="w-full flex flex-row gap-2 items-center cursor-pointer">
          <Link
            href={createUnauthorizeUrl({ redirectAfter: fullPathname })}
            className="w-full flex flex-row gap-2 items-center"
          >
            <Icon icon="tabler:logout" className="text-sm" />
            <Text element="span">Logg ut</Text>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const ThemeMenuSub = () => {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <div className="w-full flex flex-row gap-2 items-center">
          <Icon icon="tabler:sun" />
          <Text element="span">Fargetema</Text>
        </div>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <DropdownMenuRadioGroup value={theme} onValueChange={(val) => setTheme(val)}>
            {THEME_OPTIONS.map((item) => (
              <DropdownMenuRadioItem
                className="w-full flex flex-row gap-2 items-center"
                value={item.theme}
                key={item.theme}
              >
                <Icon icon={item.icon} className="text-sm" />
                <Text element="span">{item.label}</Text>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  )
}
