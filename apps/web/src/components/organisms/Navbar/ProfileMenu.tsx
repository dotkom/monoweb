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
} from "@dotkomonline/ui";
import type { FC, PropsWithChildren } from "react";
import { getSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { cva } from "cva";
const navigationMenuTriggerStyle = cva(
  "inline-flex items-center justify-center relative rounded-md text-sm font-semibold transition-colors focus:outline-none focus:bg-slate-4 disabled:opacity-50 disabled:pointer-events-none bg-transparent hover:bg-slate-4 data-[state=open]:bg-slate-4 h-10 py-2 px-4 group",
);

export const ProfileMenu = async () => {
  const session = await getSession();

  if (!session) {
    return (
      <>
        <Button
          variant="subtle"
          className={cn(
            navigationMenuTriggerStyle(),
            "hover:translate-y-0 active:translate-y-0",
          )}
          onClick={() => signIn("auth0")}
        >
          Log in
        </Button>
        <Button
          variant="gradient"
          className={cn(
            navigationMenuTriggerStyle(),
            "ml-3 hover:translate-y-0 active:translate-y-0",
          )}
          onClick={async () => signIn("auth0")}
        >
          Sign up
        </Button>
      </>
    );
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
  );
};

interface LinkDetail {
  label: string;
  icon: string;
  shortcut?: string;
  href?: string;
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
      label: "Instillinger",
      shortcut: "⌘S",
      href: "/profile",
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
                <Link href={link.href || ""}>
                  <Icon icon={link.icon} className="mr-2 h-4 w-4" />
                  <span>{link.label}</span>
                  {link.shortcut && (
                    <DropdownMenuShortcut>{link.shortcut}</DropdownMenuShortcut>
                  )}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </>
      ))}
      <DropdownMenuSeparator />
      <ThemeMenuSub />
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={async () => signOut()}>
        <Icon icon="tabler:logout" className="mr-2 h-4 w-4" />
        <span>Log out</span>
        <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const ThemeMenuSub = () => {
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
  ];

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Icon icon="tabler:sun" className="mr-2 h-4 w-4" />
        <span>Theme</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <DropdownMenuRadioGroup value={"light"}>
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
  );
};
