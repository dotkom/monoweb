"use client"

import { Button, Icon, cn } from "@dotkomonline/ui"
import { usePathname } from "next/navigation"
import type { FC } from "react"
import { useEffect, useState } from "react"

export type SettingsMenuItemProps = {
  title: string
  slug: string
  icon: string
}

export const SettingsMenuItem: FC<SettingsMenuItemProps> = ({ title, slug, icon }) => {
  const path = usePathname()
  const [isCurrent, setCurrent] = useState<boolean>(false)

  useEffect(() => {
    setCurrent(path === slug)
  }, [path, slug])

  return (
    <Button
      element="a"
      href={slug}
      icon={<Icon icon={icon} className="text-lg" />}
      variant="text"
      color="light"
      size="lg"
      className={cn(
        "justify-start px-3 -ml-3 py-2 rounded-md gap-2",
        isCurrent ? "bg-gray-50 dark:bg-stone-900 font-semibold" : "text-gray-700 dark:text-stone-300"
      )}
    >
      {title}
    </Button>
  )
}
