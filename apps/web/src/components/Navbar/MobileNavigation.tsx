"use client"

import { Icon, cn } from "@dotkomonline/ui"
import * as Popover from "@radix-ui/react-popover"
import Link from "next/link"
import { type FC, Fragment, useState } from "react"

import type { MenuLink } from "@/components/Navbar/Navbar"

export const MobileNavigation: FC<{ links: MenuLink[] }> = ({ links }) => {
  const [open, setOpen] = useState(false)

  return (
    <Popover.Root onOpenChange={(val) => setOpen(val)}>
      <Popover.Trigger>
        <div className={cn("flex items-center md:hidden")}>
          {open ? <Icon height={32} icon="tabler:x" /> : <Icon height={32} icon="tabler:menu-2" />}
        </div>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="w-screen border-t bg-slate-50 animate-in fade-in-20 p-6 mt-8">
          <nav className="flex flex-col gap-4">
            {links.map((link) => (
              <Fragment key={link.title}>
                <Popover.Close asChild>
                  <Link
                    href={"href" in link ? link.href : "#"}
                    className={cn(
                      "inline-flex py-2 text-lg font-semibold text-black hover:bg-slate-100 rounded-md px-2 transition-colors",
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
                          "ml-4 inline-flex py-2 text-base font-medium text-black hover:bg-slate-100 rounded-md px-2 transition-colors",
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
  )
}
