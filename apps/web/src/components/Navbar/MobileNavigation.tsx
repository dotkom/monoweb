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
        <Popover.Content className="h-screen w-screen border-slate-6 border-t bg-brand-1 animate-in fade-in-20 px-4 mt-2">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Fragment key={link.title}>
                <Link
                  href={"href" in link ? link.href : "#"}
                  className={cn("inline-flex text-lg font-semibold text-slate-12", "href" in link && "font-normal")}
                >
                  {link.title}
                </Link>
                {"items" in link &&
                  link.items.map((link) => (
                    <Link
                      key={link.title}
                      href={"href" in link ? link.href : "#"}
                      className={cn(
                        "ml-4 inline-flex text-lg font-semibold text-slate-12",
                        "href" in link && "font-normal"
                      )}
                    >
                      {link.title}
                    </Link>
                  ))}
              </Fragment>
            ))}
          </nav>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
