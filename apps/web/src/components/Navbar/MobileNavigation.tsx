"use client"

import { useFullPathname } from "@/utils/use-full-pathname"
import { useSession } from "@dotkomonline/oauth2/react"
import { Button, Icon, cn } from "@dotkomonline/ui"
import * as Popover from "@radix-ui/react-popover"
import * as ScrollArea from "@radix-ui/react-scroll-area"
import Link from "next/link"
import { type FC, Fragment, useEffect, useRef, useState } from "react"

import type { MenuLink } from "@/components/Navbar/Navbar"
import { env } from "@/env"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { Hamburger } from "./Hamburger"
import { ThemeToggle } from "./ThemeToggle"

export const MobileNavigation: FC<{ links: MenuLink[] }> = ({ links }) => {
  const [open, setOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const session = useSession()
  const fullPathname = useFullPathname()

  const homeLink: MenuLink = {
    title: "Hjem",
    href: env.NEXT_PUBLIC_HOME_URL,
    icon: "tabler:home",
  }
  const linksWithHome = [homeLink, ...links]

  // Lock body scroll when menu is open
  useEffect(() => {
    if (open) {
      const originalStyle = window.getComputedStyle(document.body).overflow
      document.body.style.overflow = "hidden"

      return () => {
        document.body.style.overflow = originalStyle
      }
    }
  }, [open])

  return (
    <div className="md:hidden">
      <Popover.Root onOpenChange={(val) => setOpen(val)}>
        <Popover.Trigger
          className="flex flex-row items-center"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <Hamburger open={open} />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className="z-99 md:hidden w-screen animate-in fade-in-20 p-4">
            <nav
              ref={navRef}
              className="z-99 flex flex-col h-[calc(100dvh-10rem)] bg-blue-100/80 dark:bg-stone-800/90 backdrop-blur-xl border border-blue-100 dark:border-stone-700/30 shadow-sm mt-4 rounded-3xl"
            >
              <ScrollArea.Root type="always" className="z-50 h-full overflow-hidden">
                <ScrollArea.Viewport className="w-full h-full">
                  <div className="p-4">
                    {linksWithHome.map((link) =>
                      ("items" in link ? link.items : [link]).map((link) => (
                        <Fragment key={link.title}>
                          <Popover.Close asChild>
                            <Link
                              href={"href" in link ? link.href : "#"}
                              className={cn(
                                "flex items-center gap-3 p-4 rounded-lg hover:bg-blue-200 dark:hover:bg-stone-700 transition-colors",
                                "href" in link && ""
                              )}
                            >
                              <Icon className="text-xl" icon={link.icon} />
                              {link.title}
                            </Link>
                          </Popover.Close>
                        </Fragment>
                      ))
                    )}

                    {session === null && (
                      <div className="py-6">
                        <div className="mb-4 mx-2 border-t border-gray-400 dark:border-stone-700" />
                        <div className="flex items-center justify-between">
                          <ThemeToggle size="lg" />
                          <Popover.Close asChild>
                            <Button
                              element={Link}
                              variant="solid"
                              size="md"
                              className="font-semibold rounded-lg justify-start px-3 h-10 bg-blue-100 hover:bg-blue-200 dark:bg-stone-700 dark:hover:bg-stone-600"
                              href={createAuthorizeUrl({ redirectAfter: fullPathname })}
                            >
                              Logg inn uten Feide
                            </Button>
                          </Popover.Close>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea.Viewport>

                <ScrollArea.Scrollbar
                  className="flex select-none touch-none px-1 py-3 transition-colors duration-300 ease-out data-[orientation=vertical]:w-4"
                  orientation="vertical"
                >
                  <ScrollArea.Thumb className="flex-1 bg-gray-400/30 dark:bg-stone-700 rounded-full hover:bg-gray-400 dark:hover:bg-stone-500 transition-colors duration-200" />
                </ScrollArea.Scrollbar>
              </ScrollArea.Root>
            </nav>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}
