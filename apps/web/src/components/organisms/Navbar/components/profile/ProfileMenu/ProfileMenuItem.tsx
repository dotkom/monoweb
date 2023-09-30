
import { IconProps } from "@dotkomonline/ui"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"

interface ProfileMenuItemProps {
  menuItem: {
    title: string
    slug: string
    icon(): JSX.Element
  }
}

const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({ menuItem }) => {
  const router = useRouter()

  const { title, slug } = menuItem

  const [isCurrent, setCurrent] = useState(router.pathname == slug ? "opacity-1" : "opacity-50")

  const handleChange = () => {
    router.push(slug)
  }

  useEffect(() => {
    setCurrent(router.pathname == slug ? "opacity-1" : "opacity-50")
  }, [router.pathname, slug])

  return (
    <div onClick={handleChange} className="!hover:text-blue hover:cursor-pointer flex flex-row mb-4 items-center text-slate-12">
      <div className={`mr-4 ${isCurrent}`}>
      <menuItem.icon />
      </div>
      <p className={isCurrent}>{title}</p>
    </div>
  )
}

export default ProfileMenuItem
