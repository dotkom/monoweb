import { ProfileContext } from "@/components/views/ProfileView/context/ProfileContext"
import { profileItems } from "@/utils/profileLinks"
import { useState } from "react"
import ProfileMenuItem from "./ProfileMenuItem"

const ProfileMenuContainer = () => {
  const [editMode, setEditMode] = useState(false)

  return (
    <div>
      <ProfileContext.Provider value={{ editMode, setEditMode }}>
        {profileItems.map((item) => (
          <ProfileMenuItem key={item.title} menuItem={item} />
        ))}
      </ProfileContext.Provider>
    </div>
  )
}

export default ProfileMenuContainer
