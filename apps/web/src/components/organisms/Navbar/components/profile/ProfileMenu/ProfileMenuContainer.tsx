import { profileItems } from "@/pages/profile/profileLinks"
import React from "react"
import ProfileMenuItem from "./ProfileMenuItem"

const ProfileMenuContainer = () => {
  return (
    <div>
      {profileItems.map((item) => (
        <ProfileMenuItem key={item.title} title={item.title} />
      ))}
    </div>
  )
}

export default ProfileMenuContainer
