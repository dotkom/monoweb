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
} from "@dotkomonline/ui";
import { signIn, signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { type FC, type PropsWithChildren } from "react";

import { navigationMenuTriggerStyle } from "./NavigationMenu";

export const ProfileMenu = () => {
  const { status } = useSession();

  if (status === "loading") {
    return <Icon className="animate-spin" icon="tabler:loader-2" />;
  }

  if (status === "unauthenticated") {
    return (
      <>
        <Button
          className={cn(navigationMenuTriggerStyle(), "hover:translate-y-0 active:translate-y-0")}
          onClick={async () => signIn("cognito")}
          variant="subtle"
        >
          Log in
        </Button>
        <Button
          className={cn(navigationMenuTriggerStyle(), "ml-3 hover:translate-y-0 active:translate-y-0")}
          onClick={async () => signIn("cognito")}
          variant="gradient"
        >
          Sign up
        </Button>
      </>
    );
  }

  return (
    <div>
      <AvatarDropdown>
        <Avatar>
          <AvatarImage
            alt="@rick"
            src="https://www.nicepng.com/png/detail/9-92047_pickle-rick-transparent-rick-and-morty-pickle-rick.png"
          />
          <AvatarFallback>PR</AvatarFallback>
        </Avatar>
      </AvatarDropdown>
    </div>
  );
};

interface Link {
  icon: string;
  label: string;
  shortcut?: string;
}
const linkGroups: Array<Array<Link>> = [
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
];

const AvatarDropdown: FC<PropsWithChildren> = ({ children }) => (
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
                <Icon className="mr-2 h-4 w-4" icon={link.icon} />
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
      <DropdownMenuItem onClick={async () => signOut()}>
        <Icon className="mr-2 h-4 w-4" icon="tabler:logout" />
        <span>Log out</span>
        <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const ThemeMenuSub = () => {
  const { setTheme, theme } = useTheme();

  const items: Array<{ icon: string; theme: string }> = [
    {
      icon: "tabler:sun",
      theme: "light",
    },
    {
      icon: "tabler:moon",
      theme: "dark",
    },
    {
      icon: "tabler:device-desktop",
      theme: "system",
    },
  ];

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Icon className="mr-2 h-4 w-4" icon="tabler:sun" />
        <span>Theme</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <DropdownMenuRadioGroup onValueChange={(val) => setTheme(val)} value={theme}>
            {items.map((item) => (
              <DropdownMenuRadioItem key={item.theme} value={item.theme}>
                <Icon className="mr-2 h-4 w-4" icon={item.icon} />
                <span className="capitalize">{item.theme}</span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
};
