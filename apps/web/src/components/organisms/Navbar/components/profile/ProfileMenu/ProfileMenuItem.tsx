import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"

interface ProfileMenuItemProps {
  menuItem: {
    title: string
    slug: string
  }
}

const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({ menuItem }) => {
  const router = useRouter()

  const { title, slug } = menuItem

  const [isCurrent, setCurrent] = useState(router.query.slug == slug ? "text-white" : "text-slate-7")

  const handleChange = () => {
    router.push(`/profile/${slug}`)
  }

  useEffect(() => {
    setCurrent(router.query.slug == slug ? "text-white" : "text-slate-7")
  }, [router.query.slug, slug])

  return (
    <div onClick={handleChange} className="!hover:text-blue hover:cursor-pointer">
      <p className={isCurrent}>{title}</p>
    </div>
  )
}

export default ProfileMenuItem
