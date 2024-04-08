"use client"
import { Icon, cn } from "@dotkomonline/ui"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type React from "react"
import { useEffect, useState } from "react"

interface SettingsMenuItemProps {
  menuItem: {
    title: string
    slug: string
    icon: string
  }
}

const SettingsMenuItem: React.FC<SettingsMenuItemProps> = ({ menuItem }) => {
  const path = usePathname()
  const { title, slug, icon } = menuItem

  const [isCurrent, setCurrent] = useState("")

  useEffect(() => {
    setCurrent(path === slug ? "bg-slate-4" : "")
  }, [path, slug])

  return (
    <Link
      href={slug}
      className={cn(
        "text-slate-12 w-full flex flex-row items-center hover:cursor-pointer hover:bg-slate-4 px-3 py-2 rounded-lg",
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

export default SettingsMenuItem
