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
  <NavigationMenu className="grow hidden md:flex justify-start ml-4">
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
                  className="group hover:bg-gray-100 dark:hover:bg-stone-600 block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-hidden transition-colors"
                >
                  <Text className="text-gray-900 dark:text-stone-100 group-hover:text-black dark:group-hover:text-white text-sm font-bold leading-none">
                    {item.title}
                  </Text>
                  <Text className="text-gray-800 dark:text-stone-200 group-hover:text-black dark:group-hover:text-white line-clamp-2 text-sm font-medium leading-snug">
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
