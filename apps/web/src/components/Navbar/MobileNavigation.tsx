"use client"

import { Icon, cn } from "@dotkomonline/ui"
import * as Popover from "@radix-ui/react-popover"
import Link from "next/link"
import { type FC, Fragment, useState } from "react"

import type { MenuLink } from "@/components/Navbar/Navbar"
import { env } from "@/env"

export const MobileNavigation: FC<{ links: MenuLink[] }> = ({ links }) => {
  const [open, setOpen] = useState(false)

  const linksWithHome = [{ title: "Hjem", href: env.NEXT_PUBLIC_HOME_URL }, ...links]

  return (
    <div className="block grow md:hidden md:grow-0">
      <Popover.Root onOpenChange={(val) => setOpen(val)}>
        <Popover.Trigger className="flex flex-row items-center">
          {open ? <Icon height={32} icon="tabler:x" /> : <Icon height={32} icon="tabler:menu-2" />}
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className="w-screen bg-white dark:bg-stone-800 animate-in fade-in-20 p-6 mt-8">
            <nav className="flex flex-col gap-4">
              {linksWithHome.map((link) => (
                <Fragment key={link.title}>
                  <Popover.Close asChild>
                    <Link
                      href={"href" in link ? link.href : "#"}
                      className={cn(
                        "font-body inline-flex py-2 text-lg font-semibold hover:bg-gray-100 rounded-md px-2 transition-colors",
                        "href" in link && "font-normal"
                      )}
                    >
                      {link.title}
                    </Link>
                  </Popover.Close>
                  {"items" in link &&
                    link.items.map((link) => (
                      <Popover.Close asChild key={link.title}>
                        <Link
                          href={"href" in link ? link.href : "#"}
                          className={cn(
                            "ml-4 inline-flex py-2 text-base font-medium text-black hover:bg-gray-100 rounded-md px-2 transition-colors",
                            "href" in link && "font-normal"
                          )}
                        >
                          {link.title}
                        </Link>
                      </Popover.Close>
                    ))}
                </Fragment>
              ))}
            </nav>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}
