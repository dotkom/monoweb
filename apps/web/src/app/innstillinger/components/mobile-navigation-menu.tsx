"use client"

import * as Popover from "@radix-ui/react-popover"
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { settingsNavigationItems } from "./navigation-menu"
import { SettingsMenuItem } from "./settings-menu-item"

export const MobileProfileNavigationMenu = () => {
  const currentSlug = usePathname()
  const currentLink = settingsNavigationItems.find((item) => item.slug === currentSlug)
  const [open, setOpen] = useState(false)

  const CurrentIcon = currentLink?.icon

  return (
    <div className="mx-auto flex items-center md:hidden">
      <Popover.Root open={open} onOpenChange={(val: boolean) => setOpen(val)}>
        <Popover.Trigger>
          <div className="mt-3 flex">
            <span className="float-left">
              {open ? <IconChevronDown width={28} height={28} /> : <IconChevronRight width={28} height={28} />}
            </span>
            <p className="flex grow justify-center">
              {CurrentIcon && <CurrentIcon width={28} height={28} />}
              <span className="ml-2 mt-1 text-lg">{currentLink?.title}</span>
            </p>
          </div>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className="animate-in fade-in-10">
            <div className="bg-indigo-50 shadow-gray-700 flex w-screen flex-col rounded-lg p-3 shadow-xs md:hidden">
              {settingsNavigationItems.map((item) => (
                <Popover.Close key={item.title}>
                  <SettingsMenuItem {...item} />
                </Popover.Close>
              ))}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}
