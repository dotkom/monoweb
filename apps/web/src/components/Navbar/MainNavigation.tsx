"use client"

import type { MenuLink } from "@/components/Navbar/Navbar"
import { Icon, Text } from "@dotkomonline/ui"
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
  <NavigationMenu className="grow hidden md:flex justify-start ml-2 lg:ml-4">
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
          <ul className="grid w-[700px] gap-2 p-4 md:grid-cols-2">
            {link.items.map((item) => (
              <NavigationMenuLink asChild key={`${link.title}-${item.title}`}>
                <Link
                  href={item.href}
                  className="group hover:bg-blue-100 dark:hover:bg-stone-700 block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-hidden transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <Icon
                      icon={item.icon}
                      width={20}
                      height={20}
                      className="text-gray-600 dark:text-stone-400 group-hover:text-gray-800 dark:group-hover:text-stone-200 mt-0.5 flex-shrink-0"
                    />
                    <div className="flex flex-col space-y-1">
                      <Text className="text-gray-900 dark:text-stone-100 group-hover:text-black dark:group-hover:text-white text-sm font-bold leading-none">
                        {item.title}
                      </Text>
                      <Text className="text-gray-800 dark:text-stone-200 group-hover:text-black dark:group-hover:text-white line-clamp-2 text-sm font-medium leading-snug">
                        {item.description}
                      </Text>
                    </div>
                  </div>
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
