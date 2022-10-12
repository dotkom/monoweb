import { profileItems } from "@/pages/profile/profileLinks"
import React from "react"
import ProfileMenuItem from "./ProfileMenuItem"

interface ProfileMenuContainerProps {}

const ProfileMenuContainer: React.FC<ProfileMenuContainerProps> = ({}) => {
  return (
    <div>
      {profileItems.map((item) => (
        <ProfileMenuItem item={item} key={item.title} />
      ))}
    </div>
  )
}

export default ProfileMenuContainer
