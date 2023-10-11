import { Icon } from "@dotkomonline/ui"
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

  const [isCurrent, setCurrent] = useState(router.pathname === slug ? "opacity-1" : "opacity-50")

  const handleChange = () => {
    router.push(slug)
  }

  useEffect(() => {
    setCurrent(router.pathname == slug ? "opacity-1" : "opacity-50")
  }, [router.pathname, slug])

  return (
    <div
      onClick={handleChange}
      className="!hover:text-blue text-slate-12 mb-4 flex flex-row items-center hover:cursor-pointer"
    >
      <div className={`mr-4 ${isCurrent} h-6 w-6`}>
        <Icon icon={icon} width="w-6" />
      </div>
      <p className={isCurrent}>{title}</p>
    </div>
  )
}

export default ProfileMenuItem
