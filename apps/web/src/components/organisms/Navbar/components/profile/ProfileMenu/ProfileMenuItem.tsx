import { Icon, cn } from "@dotkomonline/ui"
import Link from "next/link"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"

interface ProfileMenuItemProps {
  menuItem: {
    title: string
    slug: string
    icon: string
  }
}

const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({ menuItem }) => {
  const router = useRouter()

  const { title, slug, icon } = menuItem

  const [isCurrent, setIsCurrent] = useState(router.pathname === slug ? "opacity-1" : "opacity-50")

  useEffect(() => {
    setIsCurrent(router.pathname === slug ? "opacity-1" : "opacity-50")
  }, [router.pathname, slug])

  return (
    <div className={cn("mr-4 h-6 w-6", isCurrent)}>
      <Link
        className="hover:text-slate-11 text-slate-12 hover:fade-in-50 mb-4 flex flex-row items-center hover:cursor-pointer"
        href={slug}
      >
        <Icon icon={icon} width="w-6" />
        <p className={isCurrent}>{title}</p>
      </Link>
    </div>
  )
}

export default ProfileMenuItem
