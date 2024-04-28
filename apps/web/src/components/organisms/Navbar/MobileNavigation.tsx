"use client"

import { Icon, cn } from "@dotkomonline/ui"
import * as Popover from "@radix-ui/react-popover"
import Link from "next/link"
import { type FC, useEffect, useState } from "react"
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "./NavigationMenu"
import type { MenuLink } from "./types"

export const MobileNavigation: FC<{ links: MenuLink[] }> = ({ links }) => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) {
      document.body.classList.add("overflow-hidden")
    } else {
      document.body.classList.remove("overflow-hidden")
    }
  }, [open])

  return (
    <Popover.Root onOpenChange={(val) => setOpen(val)}>
      <Popover.Trigger>
        <div className={cn("mr-7 flex items-center md:hidden")}>
          {open ? <Icon height={32} icon="tabler:x" /> : <Icon height={32} icon="tabler:menu-2" />}
        </div>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="h-screen w-screen bg-indigo-1 animate-in fade-in-20">
          <NavigationMenu className="[&>div]:w-full">
            <NavigationMenuList className="flex-col">
              {links.map((link) => (
                <NavigationMenuItem key={link.title} className="w-full">
                  {/* Flatten the list of navigation links */}
                  {"items" in link ? (
                    <>
                      {link.items.map((item) => (
                        <MobileMenuItem link={item} key={`menu-item-${item.title}`} />
                      ))}
                    </>
                  ) : (
                    <MobileMenuItem link={link} />
                  )}
                </NavigationMenuItem>
              ))}
              <NavigationMenuItem />
            </NavigationMenuList>
          </NavigationMenu>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

const MobileMenuItem = ({ link }: { link: MenuLink }) => (
  <NavigationMenuLink asChild>
    <Link
      href={"href" in link ? link.href : "#"}
      className="mx-8 flex h-14 w-[calc(100%-theme(space.16))] items-center border-b border-blue-12/10 text-lg font-semibold"
    >
      {link.title}
    </Link>
  </NavigationMenuLink>
)
