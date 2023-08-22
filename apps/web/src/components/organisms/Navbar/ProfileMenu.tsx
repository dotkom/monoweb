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
} from "@dotkomonline/ui"
import { useRouter } from "next/router"
import { FC, PropsWithChildren } from "react"
import { useTheme } from "next-themes"
import { navigationMenuTriggerStyle } from "./NavigationMenu"

export const ProfileMenu = () => {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) {
    return <Icon icon="tabler:loader-2" className="animate-spin" />
  }

  if (!isSignedIn) {
    return (
      <>
        <Button
          variant="subtle"
          className={cn(navigationMenuTriggerStyle(), "hover:translate-y-0 active:translate-y-0")}
          onClick={() => router.push("/sign-in")}
        >
          Log in
        </Button>
        <Button
          variant="gradient"
          className={cn(navigationMenuTriggerStyle(), "ml-3 hover:translate-y-0 active:translate-y-0")}
          onClick={() => router.push("/sign-up")}
        >
          Sign up
        </Button>
      </>
    )
  }

  return (
    <div>
      <AvatarDropdown>
        <Avatar>
          <AvatarImage
            src="https://www.nicepng.com/png/detail/9-92047_pickle-rick-transparent-rick-and-morty-pickle-rick.png"
            alt="@rick"
          />
          <AvatarFallback>PR</AvatarFallback>
        </Avatar>
      </AvatarDropdown>
    </div>
  )
}

type Link = {
  label: string
  icon: string
  shortcut?: string
}
const linkGroups: Link[][] = [
  [
    {
      icon: "tabler:user",
      label: "Profil",
      shortcut: "⇧⌘P",
    },
    {
      icon: "tabler:credit-card",
      label: "Saldo",
      shortcut: "⌘B",
    },
    {
      icon: "tabler:settings",
      label: "Instillinger",
      shortcut: "⌘S",
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

// TODO: link
const AvatarDropdown: FC<PropsWithChildren> = ({ children }) => {
  const { signOut } = useAuth()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-60">
        <DropdownMenuLabel>Min bruker</DropdownMenuLabel>
        {linkGroups.map((group) => (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {group.map((link) => (
                <DropdownMenuItem key={link.label}>
                  <Icon icon={link.icon} className="mr-2 h-4 w-4" />
                  <span>{link.label}</span>
                  {link.shortcut && <DropdownMenuShortcut>{link.shortcut}</DropdownMenuShortcut>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        ))}
        <DropdownMenuSeparator />
        <ThemeMenuSub />
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <Icon icon="tabler:logout" className="mr-2 h-4 w-4" />
          <span>Log out</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

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
              <DropdownMenuRadioItem value={item.theme} key={item.theme}>
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
