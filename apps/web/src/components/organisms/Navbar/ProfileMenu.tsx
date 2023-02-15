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
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { FC, PropsWithChildren } from "react"
import { useTheme } from "next-themes"
import { navigationMenuTriggerStyle } from "./NavigationMenu"

export const ProfileMenu = () => {
  const router = useRouter()
  const { data: _session, status } = useSession()

  if (status === "loading") {
    return <Icon icon="tabler:loader-2" className="animate-spin" />
  }

  if (status === "unauthenticated") {
    return (
      <>
        <Button
          variant="subtle"
          className={cn(navigationMenuTriggerStyle(), "hover:translate-y-0 active:translate-y-0")}
          onClick={() => signIn("onlineweb")}
        >
          Log in
        </Button>
        <Button
          variant="gradient"
          className={cn(navigationMenuTriggerStyle(), "ml-3 hover:translate-y-0 active:translate-y-0")}
          onClick={() => router.push("/auth/signup")}
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

const AvatarDropdown: FC<PropsWithChildren> = ({ children }) => {
  const { setTheme, theme } = useTheme()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Min bruker</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Icon icon="tabler:user" className="mr-2 h-4 w-4" />
            <span>Profil</span>
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Icon icon="tabler:credit-card" className="mr-2 h-4 w-4" />
            <span>Saldo</span>
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Icon icon="tabler:settings" className="mr-2 h-4 w-4" />
            <span>Instillinger</span>
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Icon icon="tabler:device-desktop-analytics" className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Icon icon="tabler:adjustments" className="mr-2 h-4 w-4" />
            <span>Adminpanel</span>
            <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Icon icon="tabler:mail-forward" className="mr-2 h-4 w-4" />
            <span>Kontakt oss</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Icon icon="noto:eggplant" className="mr-2 h-4 w-4" />
            <span>Opplevd noe ugreit?</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Icon icon="tabler:bug" className="mr-2 h-4 w-4" />
            <span>Rapporter en feil</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Icon icon="tabler:sun" className="mr-2 h-4 w-4" />
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={theme} onValueChange={(val) => setTheme(val)}>
                <DropdownMenuRadioItem value="light">
                  <Icon icon="tabler:sun" className="mr-2 h-4 w-4" />
                  <span>Light theme</span>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">
                  <Icon icon="tabler:moon" className="mr-2 h-4 w-4" />
                  <span>Dark theme</span>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="right">
                  <Icon icon="tabler:device-desktop" className="mr-2 h-4 w-4" />
                  <span>System</span>
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Icon icon="tabler:logout" className="mr-2 h-4 w-4" />
          <span>Log out</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
