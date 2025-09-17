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

      const mediaQuery = window.matchMedia("(min-width: 64rem)")

      const handleMediaChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          document.body.style.overflow = originalStyle
          setOpen(false)
        }
      }

      mediaQuery.addEventListener("change", handleMediaChange)

      if (mediaQuery.matches) {
        document.body.style.overflow = originalStyle
        setOpen(false)
      }

      return () => {
        document.body.style.overflow = originalStyle
        mediaQuery.removeEventListener("change", handleMediaChange)
      }
    }
  }, [open])

  return (
    <div className="lg:hidden">
      <Popover.Root onOpenChange={(val) => setOpen(val)}>
        <Popover.Trigger
          className="flex flex-row items-center"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <Hamburger open={open} />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className="z-99 lg:hidden w-screen animate-in fade-in-20 p-4">
            <nav
              ref={navRef}
              className="z-99 max-h-[calc(100dvh-10rem)] bg-blue-50 dark:bg-stone-800 border border-blue-100 dark:border-stone-700 shadow-sm mt-4 rounded-3xl"
            >
              <ScrollArea.Root type="always" className="z-50 max-h-[inherit] overflow-hidden">
                <ScrollArea.Viewport className="w-full max-h-[inherit]">
                  <div className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                      {linksWithHome.map((link) =>
                        ("items" in link ? link.items : [link]).map((link) => (
                          <Fragment key={link.title}>
                            <Popover.Close asChild>
                              <Link
                                href={"href" in link ? link.href : "#"}
                                className={cn(
                                  "flex items-center gap-3 p-4 rounded-lg hover:bg-blue-100 dark:hover:bg-stone-700 transition-colors",
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
                    </div>

                    {session === null && (
                      <div className="pt-6 px-2 pb-2">
                        <div className="mb-4 border-t border-gray-400 dark:border-stone-700" />
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
