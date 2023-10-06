import Link from "next/link";
import { type FC } from "react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./NavigationMenu";
import { type MenuLink } from "./types";

export const MainNavigation: FC<{ links: Array<MenuLink> }> = ({ links }) => (
  <NavigationMenu className="ml-6 hidden w-min flex-1 justify-start md:flex">
    <NavigationMenuList>
      {links.map((link) => (
        <NavigationMenuItem key={link.title}>
          <DesktopNavigationLink link={link} />
        </NavigationMenuItem>
      ))}
    </NavigationMenuList>
  </NavigationMenu>
);

const DesktopNavigationLink: FC<{ link: MenuLink }> = ({ link }) => {
  const isGroupLink = "items" in link;

  if (isGroupLink) {
    return (
      <>
        <NavigationMenuTrigger>{link.title}</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="grid w-[600px] gap-3 p-4 md:grid-cols-2">
            {link.items.map((item) => (
              <NavigationMenuLink asChild key={`${link.title}-${item.title}`}>
                <Link
                  className="hover:bg-slate-3 focus:bg-slate-3 block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors "
                  href={item.href}
                >
                  <div className="text-slate-12 text-sm font-bold leading-none">{item.title}</div>
                  <p className="text-slate-11 line-clamp-2 text-sm font-medium leading-snug">{item.description}</p>
                </Link>
              </NavigationMenuLink>
            ))}
          </ul>
        </NavigationMenuContent>
      </>
    );
  }

  return (
    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
      <Link href={link.href}>{link.title}</Link>
    </NavigationMenuLink>
  );
};
