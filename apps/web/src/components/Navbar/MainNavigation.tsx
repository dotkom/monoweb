"use client"

import type { MenuLink } from "@/components/Navbar/Navbar"
import { Text, cn } from "@dotkomonline/ui"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@dotkomonline/ui/components/navigation-menu"
import { IconArrowUpRight } from "@tabler/icons-react"
import Link from "next/link"
import type { FC } from "react"
import { isExternal } from "../../utils/is-link-external"

export const MainNavigation: FC<{ links: MenuLink[] }> = ({ links }) => (
  <NavigationMenu
    className="grow hidden lg:flex"
    viewportClassName="bg-blue-50 dark:bg-stone-800 border-blue-100 dark:border-stone-700/30 shadow-sm rounded-3xl"
  >
    <NavigationMenuList className="mx-auto">
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
        <NavigationMenuTrigger
          className={cn(
            "rounded-full px-1.5 lg:px-4 hover:bg-blue-200 data-popup-open:bg-blue-200",
            "dark:text-stone-300 dark:hover:bg-stone-700/50 dark:data-popup-open:bg-stone-700/50"
          )}
        >
          <Text className="text-sm">{link.title}</Text>
        </NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="grid w-[700px] gap-2 p-4 md:grid-cols-2">
            {link.items.map((item) => (
              <NavigationMenuLink
                key={`${link.title}-${item.title}`}
                render={<Link href={item.href} />}
                className="group hover:bg-blue-100/80 dark:hover:bg-stone-700/50 select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-hidden transition-colors"
              >
                <div className="flex items-start gap-2">
                  {(() => {
                    const IconComponent = item.icon
                    return (
                      <IconComponent
                        width={20}
                        height={20}
                        className="text-gray-600 dark:text-stone-400 group-hover:text-gray-800 dark:group-hover:text-stone-200 mt-0.5 shrink-0"
                      />
                    )
                  })()}
                  <div className="flex flex-col space-y-1.5 grow">
                    <Text className="text-gray-900 dark:text-stone-100 group-hover:text-black dark:group-hover:text-white text-sm font-semibold leading-none">
                      {item.title}
                    </Text>
                    <Text className="text-gray-600 dark:text-stone-400 group-hover:text-black dark:group-hover:text-white line-clamp-2 text-xs font-medium leading-snug">
                      {item.description}
                    </Text>
                  </div>
                  {isExternal(item.href) && (
                    <IconArrowUpRight className="size-5 shrink-0 text-gray-600 dark:text-stone-400" />
                  )}
                </div>
              </NavigationMenuLink>
            ))}
          </ul>
        </NavigationMenuContent>
      </>
    )
  }
  return (
    <NavigationMenuLink
      render={<Link href={link.href} />}
      className={cn(
        navigationMenuTriggerStyle,
        "rounded-full px-1.5 lg:px-4 hover:bg-blue-200 data-popup-open:bg-blue-200",
        "dark:text-stone-300 dark:hover:bg-stone-700/50 dark:data-popup-open:bg-stone-700/50"
      )}
    >
      {link.title}
    </NavigationMenuLink>
  )
}
