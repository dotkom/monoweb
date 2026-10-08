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
    viewportClassName="bg-gray-50 dark:bg-stone-800 border-gray-100 dark:border-stone-700/30 shadow-sm rounded-3xl"
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
            "rounded-full px-1.5 lg:px-4 hover:bg-gray-200 data-popup-open:bg-gray-200",
            "dark:text-stone-300 dark:hover:bg-stone-700/50 dark:data-popup-open:bg-stone-700/50"
          )}
        >
          <Text className="text-sm">{link.title}</Text>
        </NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="grid w-[700px] gap-2 p-2 md:grid-cols-2">
            {link.items.map((item) => (
              <NavigationMenuLink
                key={`${link.title}-${item.title}`}
                render={<Link href={item.href} />}
                className={cn(
                  "group transition-colors",
                  "hover:bg-gray-100/80 dark:hover:bg-stone-700/25",
                  "border border-transparent hover:border-gray-200 dark:hover:border-stone-700",
                  "select-none space-y-1",
                  "rounded-lg p-3",
                  "leading-none no-underline outline-hidden"
                )}
              >
                <div className="flex items-start gap-2">
                  {(() => {
                    const IconComponent = item.icon
                    return (
                      <IconComponent
                        width={20}
                        height={20}
                        className="text-muted-foreground group-hover:text-foreground mt-0.5 shrink-0"
                      />
                    )
                  })()}
                  <div className="flex flex-col space-y-1.5 grow">
                    <Text className="text-sm font-medium leading-none">{item.title}</Text>
                    <Text className="text-muted-foreground group-hover:text-black dark:group-hover:text-white line-clamp-2 text-xs font-medium leading-snug">
                      {item.description}
                    </Text>
                  </div>
                  {isExternal(item.href) && (
                    <IconArrowUpRight className="size-5 shrink-0 text-muted-foreground group-hover:text-foreground" />
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
        "rounded-full px-1.5 lg:px-4 hover:bg-gray-200 data-popup-open:bg-gray-200",
        "dark:text-stone-300 dark:hover:bg-stone-700/50 dark:data-popup-open:bg-stone-700/50"
      )}
    >
      {link.title}
    </NavigationMenuLink>
  )
}
