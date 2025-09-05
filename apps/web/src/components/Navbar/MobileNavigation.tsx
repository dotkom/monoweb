"use client"

import { Icon, cn } from "@dotkomonline/ui"
import * as Popover from "@radix-ui/react-popover"
import Link from "next/link"
import { type FC, Fragment, useState } from "react"

import type { MenuLink } from "@/components/Navbar/Navbar"
import { env } from "@/env"

export const MobileNavigation: FC<{ links: MenuLink[] }> = ({ links }) => {
  const [open, setOpen] = useState(false)

  const homeLink: MenuLink = {
    title: "Hjem",
    href: env.NEXT_PUBLIC_HOME_URL,
    icon: "tabler:home",
  }
  const linksWithHome = [homeLink, ...links]

  return (
    <div className="block grow md:hidden md:grow-0">
      <Popover.Root onOpenChange={(val) => setOpen(val)}>
        <Popover.Trigger className="flex flex-row items-center">
          {open ? <Icon height={32} icon="tabler:x" /> : <Icon height={32} icon="tabler:menu-2" />}
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className="w-screen max-h-screen overflow-y-auto overscroll-contain bg-white dark:bg-stone-700 animate-in fade-in-20 p-4 mt-4">
            <nav className="flex flex-col gap-4 pt-4 pb-64">
              {linksWithHome.map((link) =>
                ("items" in link ? link.items : [link]).map((link) => (
                  <Fragment key={link.title}>
                    <Popover.Close asChild>
                      <Link
                        href={"href" in link ? link.href : "#"}
                        className={cn(
                          "font-body flex items-center gap-3 p-4 bg-gray-50 dark:bg-stone-600 rounded-xl",
                          "text-lg font-semibold",
                          "href" in link && "font-medium"
                        )}
                      >
                        <Icon className="text-xl" icon={link.icon} />
                        {link.title}
                      </Link>
                    </Popover.Close>
                  </Fragment>
                ))
              )}
            </nav>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}
