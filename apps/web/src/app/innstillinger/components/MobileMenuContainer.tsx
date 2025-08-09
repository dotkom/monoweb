"use client"

import { Icon } from "@dotkomonline/ui"
import * as Popover from "@radix-ui/react-popover"
import { useState } from "react"
import { settingsNavigationItems } from "../layout"
import { SettingsMenuItem } from "./SettingsMenuItem"

export const MobileMenuContainer = () => {
  const [open, setOpen] = useState(false)

  return (
    <div className="mx-auto flex items-center md:hidden">
      <Popover.Root open={open} onOpenChange={(val: boolean) => setOpen(val)}>
        <Popover.Trigger>
          <div className="mt-3 flex">
            <span className="float-left">
              {open ? (
                <Icon icon={"tabler:chevron-down"} width={28} />
              ) : (
                <Icon icon={"tabler:chevron-right"} width={28} />
              )}
            </span>
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
