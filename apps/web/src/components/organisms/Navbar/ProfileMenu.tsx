"use client"

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
import type { Session } from "next-auth"
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import Link from "next/link"
import type { FC, PropsWithChildren } from "react"
import { navigationMenuTriggerStyle } from "./NavigationMenu"
import React from "react"

export const ProfileMenu = ({
  initialData,
}: {
  initialData: Session | null
}) => {
  return (
    <SessionProvider session={initialData}>
      <InnerProfileMenu />
    </SessionProvider>
  )
}

const InnerProfileMenu = () => {
  const { status } = useSession()

  if (status === "loading") {
    return <Icon icon="tabler:loader-2" className="animate-spin" />
  }

  if (status === "unauthenticated") {
    return (
      <>
        <Button
          variant="subtle"
          className={cn(navigationMenuTriggerStyle(), "hover:translate-y-0 active:translate-y-0")}
          onClick={async () => signIn("auth0")}
        >
          Log in
        </Button>
        <Button
          variant="gradient"
          className={cn(navigationMenuTriggerStyle(), "ml-3 hover:translate-y-0 active:translate-y-0")}
          onClick={async () => signIn("auth0")}
        >
          Sign up
        </Button>
      </>
    )
  }

  return (
    <button type="button">
      <AvatarDropdown>
        <Avatar>
          <AvatarImage
            src="https://www.nicepng.com/png/detail/9-92047_pickle-rick-transparent-rick-and-morty-pickle-rick.png"
            alt="@rick"
          />
          <AvatarFallback>PR</AvatarFallback>
        </Avatar>
      </AvatarDropdown>
    </button>
  )
}

interface LinkDetail {
  label: string
  icon: string
  shortcut?: string
  href?: string
}
const linkGroups: LinkDetail[][] = [
  [
    {
      icon: "tabler:user",
      label: "Profil",
      shortcut: "⇧⌘P",
      href: "/profile",
    },
    {
      icon: "tabler:credit-card",
      label: "Saldo",
      shortcut: "⌘B",
      href: "/profile",
    },
    {
      icon: "tabler:settings",
      label: "Innstillinger",
      shortcut: "⌘S",
      href: "/settings",
    },
  ],
  [
    {
      icon: "tabler:device-desktop-analytics",
      label: "Dashboard",
    },
    {
      icon: "tabler:adjustments",
      label: "Adminpanel",
      shortcut: "⌘+T",
    },
  ],
  [
    {
      icon: "tabler:mail-forward",
      label: "Kontakt oss",
    },
    {
      icon: "tabler:spy",
      label: "Opplevd noe ugreit?",
    },
    {
      icon: "tabler:bug",
      label: "Rapporter en feil",
    },
  ],
]

const AvatarDropdown: FC<PropsWithChildren> = ({ children }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
    <DropdownMenuContent className="w-60">
      <DropdownMenuLabel>Min bruker</DropdownMenuLabel>
      {linkGroups.map((group, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: This is a static list
        <React.Fragment key={i}>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {group.map((link) => (
              <DropdownMenuItem key={link.label}>
                <Link className="w-full" href={link.href ?? "#"}>
                  <Icon icon={link.icon} className="mr-2 h-4 w-4" />
                  <span>{link.label}</span>
                  {link.shortcut && <DropdownMenuShortcut>{link.shortcut}</DropdownMenuShortcut>}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </React.Fragment>
      ))}
      <DropdownMenuSeparator />
      <ThemeMenuSub />
      <DropdownMenuSeparator />
      <DropdownMenuItem className="cursor-pointer" onClick={async () => signOut()}>
        <Icon icon="tabler:logout" className="mr-2 h-4 w-4" />
        <span>Log out</span>
        <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)

const ThemeMenuSub = () => {
  const { setTheme, theme } = useTheme()

  const items: { theme: string; icon: string }[] = [
    {
      theme: "light",
      icon: "tabler:sun",
    },
    {
      theme: "dark",
      icon: "tabler:moon",
    },
    {
      theme: "system",
      icon: "tabler:device-desktop",
    },
  ]

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Icon icon="tabler:sun" className="mr-2 h-4 w-4" />
        <span>Theme</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <DropdownMenuRadioGroup value={theme} onValueChange={(val) => setTheme(val)}>
            {items.map((item) => (
              <DropdownMenuRadioItem className="cursor-pointer" value={item.theme} key={item.theme}>
                <Icon icon={item.icon} className="mr-2 h-4 w-4" />
                <span className="capitalize">{item.theme}</span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  )
}
