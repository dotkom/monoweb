"use client"

import type { MenuLink } from "@/components/Navbar/Navbar"
import { Text } from "@dotkomonline/ui"
import Link from "next/link"
import type { FC } from "react"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./NavigationMenu"

export const MainNavigation: FC<{ links: MenuLink[] }> = ({ links }) => (
  <NavigationMenu className="ml-6 hidden w-min flex-1 justify-start md:flex">
    <NavigationMenuList>
      {links.map((link) => (
        <NavigationMenuItem key={link.title}>
          <DesktopNavigationLink link={link} />
        </NavigationMenuItem>
      ))}
    </NavigationMenuList>
  </NavigationMenu>
)

const DesktopNavigationLink: FC<{ link: MenuLink }> = ({ link }) => {
  const isGroupLink = "items" in link
  if (isGroupLink) {
    return (
      <>
        <NavigationMenuTrigger>
          <Text>{link.title}</Text>
        </NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="grid w-[600px] gap-3 p-4 md:grid-cols-2">
            {link.items.map((item) => (
              <NavigationMenuLink asChild key={`${link.title}-${item.title}`}>
                <Link
                  href={item.href}
                  className="group hover:bg-slate-2 block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-hidden transition-colors"
                >
                  <Text className="text-slate-11 group-hover:text-slate-12 text-sm font-bold leading-none">
                    {item.title}
                  </Text>
                  <Text className="text-slate-10 group-hover:text-slate-11 line-clamp-2 text-sm font-medium leading-snug">
                    {item.description}
                  </Text>
                </Link>
              </NavigationMenuLink>
            ))}
          </ul>
        </NavigationMenuContent>
      </>
    )
  }
  return (
    <NavigationMenuLink asChild className={navigationMenuTriggerStyle}>
      <Link href={link.href} className="font-body">
        {link.title}
      </Link>
    </NavigationMenuLink>
  )
}
