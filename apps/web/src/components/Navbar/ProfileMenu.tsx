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
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RadioGroup,
  RadioGroupItem,
  Text,
  cn,
} from "@dotkomonline/ui"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { FC, PropsWithChildren } from "react"
import { Fragment } from "react"
import { navigationMenuTriggerStyle } from "./NavigationMenu"
import { th } from "date-fns/locale"

const THEME_OPTIONS = [
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

export const ProfileMenu = () => {
  const session = useSession()
  if (session === null) {
    const { setTheme, theme } = useTheme()

    return (
      <div className="flex flex-row gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="text" size="sm" className="font-semibold px-3 hover:bg-blue-3">
              <Icon icon="tabler:sun-moon" className="text-base" />
              Tema
            </Button>
          </PopoverTrigger>
          <PopoverContent className="bg-slate-1 dark:bg-slate-12 p-2">
            <RadioGroup defaultValue={theme} onValueChange={(val) => setTheme(val)} className="flex flex-col gap-2">
              {THEME_OPTIONS.map((item) => (
                <Label
                  key={item.theme}
                  htmlFor={item.theme}
                  className="flex flex-row items-center gap-2 p-2 w-full hover:bg-slate-3 dark:hover:bg-slate-11 rounded-md cursor-pointer"
                >
                  <RadioGroupItem
                    value={item.theme}
                    id={item.theme}
                    className="hidden"
                  />
                  <div className={cn("w-1 h-4 rounded-full bg-slate-6 invisible", theme === item.theme && "visible")} />
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
          className="font-semibold py-2"
          href="/api/auth/authorize"
        >
          Logg inn
        </Button>
      </div>
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
                  <Link
                    className="w-full"
                    href={link.href ?? "#"}
                    target={link.openInNewTab ? "_blank" : undefined}
                    rel="noreferrer"
                  >
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
            {THEME_OPTIONS.map((item) => (
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
