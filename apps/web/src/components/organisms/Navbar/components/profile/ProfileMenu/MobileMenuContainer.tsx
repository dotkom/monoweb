import { profileItems } from "@/utils/profileLinks"
import React, { useEffect, useState } from "react"
import ProfileMenuItem from "./ProfileMenuItem"
import * as Popover from "@radix-ui/react-popover"
import { Icon } from "@dotkomonline/ui"
import { usePathname } from "next/navigation"

const MobileMenuContainer = () => {
  const currentSlug = usePathname()
  const currentLink = profileItems.find((item) => item.slug === currentSlug)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) {
      document.body.classList.add("overflow-hidden")
    } else {
      document.body.classList.remove("overflow-hidden")
    }
  }, [open])

  return (
    <div className="mx-auto flex items-center md:hidden">
      <Popover.Root onOpenChange={(val) => setOpen(val)}>
        <Popover.Trigger>
          <div className="mt-3 flex">
            <span className="float-left">
              {open ? (
                <Icon icon={"tabler:chevron-down"} width={28} />
              ) : (
                <Icon icon={"tabler:chevron-right"} width={28} />
              )}
            </span>
            <p className="flex grow justify-center">
              <Icon icon={currentLink?.icon ? currentLink.icon : ""} width={28} />
              <span className="ml-2 mt-1 text-lg">{currentLink?.title}</span>
            </p>
          </div>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className="animate-in fade-in-10">
            <div className="bg-indigo-1 shadow-slate-8 w-screen rounded-lg p-3 shadow-sm md:hidden">
              {profileItems.map((item) => (
                <ProfileMenuItem key={item.title} menuItem={item} />
              ))}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}

export default MobileMenuContainer
