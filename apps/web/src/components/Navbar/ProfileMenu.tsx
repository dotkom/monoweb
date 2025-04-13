"use client"

import { env } from "@/env"
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
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  Icon,
  cn,
} from "@dotkomonline/ui"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { FC, PropsWithChildren } from "react"
import { Fragment } from "react"
import { navigationMenuTriggerStyle } from "./NavigationMenu"

export const ProfileMenu = () => {
  const session = useSession()
  if (session === null) {
    return (
      <>
        <Button
          element="a"
          variant="outline"
          className={cn(navigationMenuTriggerStyle(), "hover:translate-y-0 active:translate-y-0")}
          href="/api/auth/authorize"
        >
          Logg inn
        </Button>
        <Button
          element="a"
          color="gradient"
          className={cn(navigationMenuTriggerStyle(), "ml-3 hover:translate-y-0 active:translate-y-0")}
          href="/api/auth/logout"
        >
          Bli medlem
        </Button>
      </>
    )
  }

  return (
    <button type="button">
      <AvatarDropdown>
        <Avatar>
          <AvatarImage src={session.picture} alt="@rick" />
          <AvatarFallback>OW</AvatarFallback>
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
}
const linkGroups: LinkDetail[][] = [
  [
    {
      icon: "tabler:user",
      label: "Min profil",
      href: "/profile",
    },
    {
      icon: "tabler:settings",
      label: "Innstillinger",
      href: "/settings",
    },
  ],
  [
    {
      icon: "tabler:adjustments",
      label: "Dashboard",
      href: env.NEXT_PUBLIC_DASHBOARD_URL,
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

const AvatarDropdown: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-60">
        <DropdownMenuLabel>Min bruker</DropdownMenuLabel>
        {linkGroups.map((group, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: This is a static list
          <Fragment key={i}>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {group.map((link) => (
                <DropdownMenuItem key={link.label}>
                  <Link className="w-full" href={link.href ?? "#"} target={link.newTab ? "_blank" : undefined}>
                    <Icon icon={link.icon} className="mr-2 h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </Fragment>
        ))}
        <DropdownMenuSeparator />
        <ThemeMenuSub />
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/api/auth/logout")}>
          <Icon icon="tabler:logout" className="mr-2 h-4 w-4" />
          <span>Logg ut</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const items = [
  {
    theme: "light",
    label: "Lysmodus",
    icon: "tabler:sun",
  },
  {
    theme: "dark",
    label: "Nattemodus",
    icon: "tabler:moon",
  },
  {
    theme: "system",
    label: "Systempreferanse",
    icon: "tabler:device-desktop",
  },
] as const

const ThemeMenuSub = () => {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Icon icon="tabler:sun" className="mr-2 h-4 w-4" />
        <span>Fargetema</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <DropdownMenuRadioGroup value={theme} onValueChange={(val) => setTheme(val)}>
            {items.map((item) => (
              <DropdownMenuRadioItem className="cursor-pointer" value={item.theme} key={item.theme}>
                <Icon icon={item.icon} className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  )
}
