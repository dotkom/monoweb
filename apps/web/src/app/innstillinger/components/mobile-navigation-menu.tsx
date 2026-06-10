"use client"

import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Text,
} from "@dotkomonline/ui"
import { IconCheck, IconChevronDown } from "@tabler/icons-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { settingsNavigationItems } from "./navigation-menu"

export const MobileProfileNavigationMenu = () => {
  const pathname = usePathname()
  const currentLink =
    settingsNavigationItems.find((item) => pathname.startsWith(item.slug)) ?? settingsNavigationItems[0]
  const [open, setOpen] = useState(false)

  const CurrentIcon = currentLink.icon

  return (
    <nav className="mb-8 w-full md:hidden" aria-label="Innstillinger">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="unstyled"
            aria-expanded={open}
            aria-haspopup="menu"
            aria-label={`Innstillinger: ${currentLink.title}. Åpne meny for å bytte seksjon.`}
            className={cn(
              "flex w-full items-center rounded-xl border p-2 text-left",
              "border-gray-200 bg-white",
              "dark:border-stone-700 dark:bg-stone-800",
              "transition-colors hover:bg-gray-50 dark:hover:bg-stone-700/80",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 dark:focus-visible:ring-stone-500 dark:focus-visible:ring-offset-stone-900",
              open && "bg-gray-50 dark:bg-stone-700/50"
            )}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md">
              <CurrentIcon className="size-5 text-gray-700 dark:text-stone-200" aria-hidden />
            </span>
            <span className="flex min-w-0 grow flex-col">
              <Text element="span" className="truncate text-base font-semibold text-gray-700 dark:text-stone-300">
                {currentLink.title}
              </Text>
            </span>
            <IconChevronDown
              className={cn(
                "size-5 shrink-0 text-gray-500 transition-transform duration-200 dark:text-stone-400",
                open && "rotate-180"
              )}
              aria-hidden
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          side="bottom"
          sideOffset={8}
          className="w-(--anchor-width) space-y-2 p-2 rounded-xl border-gray-200 dark:border-stone-700 dark:bg-stone-800"
        >
          {settingsNavigationItems.map((item) => {
            const isCurrent = pathname.startsWith(item.slug)
            const ItemIcon = item.icon

            return (
              <DropdownMenuItem key={item.slug} asChild>
                <Link
                  href={item.slug}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-3 rounded-md p-3",
                    isCurrent ? "bg-gray-100 dark:bg-stone-700/50" : "text-gray-500 dark:text-stone-500"
                  )}
                >
                  <ItemIcon className="size-5 shrink-0" aria-hidden />
                  <Text element="span" className="grow text-base">
                    {item.title}
                  </Text>
                  {isCurrent && (
                    <IconCheck className="size-5 shrink-0 text-brand-700 dark:text-brand-400" aria-hidden />
                  )}
                </Link>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  )
}
