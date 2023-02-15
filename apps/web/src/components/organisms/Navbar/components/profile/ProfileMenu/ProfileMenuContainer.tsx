import { ProfileContext } from "@/components/views/ProfileView/context/ProfileContext"
import { profileItems } from "@/utils/profileLinks"
import { useState } from "react"
import ProfileMenuItem from "./ProfileMenuItem"

const ProfileMenuContainer = () => {
  return (
    <div>
      {profileItems.map((item) => (
        <ProfileMenuItem key={item.title} menuItem={item} />
      ))}
    </div>
  )
}

export default ProfileMenuContainer
