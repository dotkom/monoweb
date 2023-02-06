"use client"

import { NavigationMenuIndicator } from "@radix-ui/react-navigation-menu"
import * as React from "react"
import { cn } from "../../utils"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./NavigationMenu"

type MenuItem = {
  title: string
  href: string
  description?: string
}
type Link =
  | MenuItem
  | {
      title: string
      items: MenuItem[]
    }

const links: Link[] = [
  {
    title: "Arrangementer",
    href: "/events",
  },
  {
    title: "Karriere",
    href: "/career",
  },
  {
    title: "Om oss",
    items: [
      {
        title: "Interessegrupper",
        href: "#",
        description: "På denne siden finner du informasjon om alle de forskjellige interessegruppene i online",
      },
      {
        title: "Om Linjeforeningen Online",
        href: "#",
        description: "Informasjon om Linjeforeningen",
      },
    ],
  },
  {
    title: "For bedrifter",
    items: [
      { title: "Kontakt", href: "/company" },
      { title: "Kvitteringskjema", href: "/company" },
      { title: "Faktura", href: "/company" },
      { title: "Interesseskjema", href: "/company" },
    ],
  },
]

export default {
  title: "NavigationMenu",
  component: NavigationMenu,
}

export function NavigationMenuDemo() {
  return (
    <div className="h-[400px]">
      <div className="flex w-full">
        <div className="bg-blue-7 justify-center">Logo area</div>
        <div className="flex flex-1">
          <NavigationMenu className="w-min">
            <NavigationMenuList>
              {links.map((link) => (
                <NavigationMenuItem key={link.title}>
                  <NavigationLink link={link} />
                </NavigationMenuItem>
              ))}
              <NavigationMenuIndicator />
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="bg-red-7 flex flex-1">Avatar area</div>
      </div>
    </div>
  )
}

const NavigationLink: React.FC<{ link: Link }> = ({ link }) => {
  if ("items" in link) {
    return (
      <>
        <NavigationMenuTrigger>{link.title}</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="grid w-[600px] gap-3 p-4 md:grid-cols-2">
            {link.items.map((item) => (
              <ListItem title={item.title} href={item.href}>
                {item.description}
              </ListItem>
            ))}
          </ul>
        </NavigationMenuContent>
      </>
    )
  } else {
    return (
      <a href={link.href}>
        <NavigationMenuLink className={navigationMenuTriggerStyle()}>{link.title}</NavigationMenuLink>
      </a>
    )
  }
}

const ListItem = React.forwardRef<React.ElementRef<"a">, React.ComponentPropsWithoutRef<"a">>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              "hover:bg-slate-2 focus:bg-slate-2 block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors ",
              className
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-slate-11 text-sm leading-snug">{children}</p>
          </a>
        </NavigationMenuLink>
      </li>
    )
  }
)
ListItem.displayName = "ListItem"
