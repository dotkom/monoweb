"use client"

import { useFullPathname } from "@/utils/use-full-pathname"
import { useSession } from "@dotkomonline/oauth2/react"
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
  Text,
  cn,
} from "@dotkomonline/ui"
import * as ScrollArea from "@radix-ui/react-scroll-area"
import Link from "next/link"
import { type FC, useEffect, useRef, useState } from "react"

import type { MenuItem, MenuLink } from "@/components/Navbar/Navbar"
import { env } from "@/env"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { Hamburger } from "./Hamburger"
import { MobileMenuCard } from "./MobileMenuCard"

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

  const highlightedLinks = linksWithHome.filter((link) => link.highlighted)
  const regularLinks = linksWithHome.filter((link) => !link.highlighted)

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
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          className="flex flex-row items-center"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <Hamburger open={open} />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          side="bottom"
          sideOffset={8}
          className="w-[calc(100vw-2rem)] mx-4 mt-4 p-0 lg:hidden bg-blue-50 z-50 dark:bg-stone-800 border-blue-100 dark:border-stone-700 shadow-sm rounded-3xl"
        >
          <nav ref={navRef} className="max-h-[calc(100dvh-10rem)]">
            <ScrollArea.Root type="always" className="z-50 max-h-[inherit] overflow-hidden">
              <ScrollArea.Viewport className="w-full max-h-[inherit]">
                <div className="p-4">
                  <div className="flex flex-col gap-4">
                    {highlightedLinks.length > 0 && (
                      <div className="flex gap-3 w-full pb-4">
                        {highlightedLinks.map((link) => {
                          const item = link as MenuItem
                          return (
                            <MobileMenuCard
                              key={item.title}
                              title={item.title}
                              href={item.href}
                              icon={item.icon}
                              onClick={() => setOpen(false)}
                            />
                          )}
                        )}
                      </div>
                    )}

                    {regularLinks.map((link) =>
                      "items" in link && link.items.length > 0 ? (
                        <div key={link.title}>
                          <Collapsible defaultOpen={false}>
                            <CollapsibleTrigger
                              className={cn(
                                "cursor-pointer w-full flex items-center justify-between sm:justify-start gap-2 font-medium text-base px-3 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-stone-700 transition-colors",
                                "[&[data-state=open]>iconify-icon]:rotate-180"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                {link.icon && <Icon className="text-xl" icon={link.icon} />}
                                <Text className="text-lg">{link.title}</Text>
                              </div>
                              <Icon icon="tabler:chevron-down" className="transition-transform text-xl" />
                            </CollapsibleTrigger>
                            <CollapsibleContent
                              className={cn(
                                "overflow-hidden",
                                "data-[state=open]:animate-collapsible-down",
                                "data-[state=closed]:animate-collapsible-up",
                                "mb-2"
                              )}
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-2">
                                {link.items.map((subLink) => (
                                  <DropdownMenuItem
                                    asChild
                                    key={subLink.title}
                                    className="flex items-start gap-2 hover:bg-blue-100 dark:hover:bg-stone-700 select-none rounded-lg p-3 border border-gray-300 dark:border-stone-700 leading-none no-underline transition-colors"
                                  >
                                    <Link href={subLink.href}>
                                      <Icon
                                        icon={subLink.icon}
                                        className="text-xl group-hover:text-gray-800 dark:group-hover:text-stone-200 mt-0.5 flex-shrink-0"
                                      />
                                      <div className="flex flex-col space-y-1">
                                        <Text className="text-gray-900 dark:text-stone-100 group-hover:text-black dark:group-hover:text-white text-base font-medium leading-none">
                                          {subLink.title}
                                        </Text>
                                        <Text className="text-gray-600 dark:text-stone-200 group-hover:text-black dark:group-hover:text-white line-clamp-2 text-sm font-medium leading-snug">
                                          {subLink.description}
                                        </Text>
                                      </div>
                                    </Link>
                                  </DropdownMenuItem>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      ) : (
                        (() => {
                          const item = link as MenuItem
                          return (
                            <DropdownMenuItem
                              asChild
                              key={item.title}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg text-base hover:bg-blue-100 dark:hover:bg-stone-700 transition-colors"
                            >
                              <Link href={item.href} onClick={() => setOpen(false)}>
                                <Icon className="text-xl" icon={item.icon} />
                                <Text className="text-lg">{item.title}</Text>
                              </Link>
                            </DropdownMenuItem>
                          )
                        })()
                      )
                    )}
                  </div>

                  {session === null && (
                    <div className="pt-8 flex justify-between gap-2">
                      <Button
                        element={Link}
                        variant="solid"
                        color="brand"
                        className="text-sm font-semibold px-3 py-2"
                        href={createAuthorizeUrl({ connection: "FEIDE", redirectAfter: fullPathname })}
                        prefetch={false}
                        icon={<Icon className="mr-1 text-xl" icon="tabler:login-2" />}
                      >
                        Logg inn
                      </Button>
                      <DropdownMenuItem asChild>
                        <Button
                          element={Link}
                          variant="solid"
                          size="md"
                          className="font-semibold rounded-md justify-start px-3 h-10 bg-blue-100/80 hover:bg-blue-200 dark:bg-stone-700/80 dark:hover:bg-stone-600 w-fit"
                          href={createAuthorizeUrl({ redirectAfter: fullPathname })}
                          onClick={() => setOpen(false)}
                        >
                          Logg inn uten Feide
                        </Button>
                      </DropdownMenuItem>
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
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
