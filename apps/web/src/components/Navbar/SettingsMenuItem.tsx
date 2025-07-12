"use client"

import { Icon, cn } from "@dotkomonline/ui"
import Link from "next/link"
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
  const [isCurrent, setCurrent] = useState("")

  useEffect(() => {
    setCurrent(path === slug ? "bg-gray-300" : "")
  }, [path, slug])

  return (
    <Link
      href={slug}
      className={cn(
        "text-black w-full flex flex-row items-center hover:cursor-pointer hover:bg-gray-300 px-3 py-2 rounded-lg",
        isCurrent
      )}
    >
      <div className={cn("mr-4 h-7 w-7")}>
        <Icon icon={icon} width="w-7" />
      </div>
      <p className="font-medium">{title}</p>
    </Link>
  )
}
