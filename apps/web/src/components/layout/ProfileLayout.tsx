import { FC, PropsWithChildren, useState } from "react"
import ProfileMenuContainer from "../organisms/Navbar/components/profile/ProfileMenu/ProfileMenuContainer"
import { ProfileContext } from "../views/ProfileView/context/ProfileContext"

const ProfileLayout: FC<PropsWithChildren> = ({ children }) => {
  const [editMode, setEditMode] = useState(false)

  return (
    <div className="m-x-auto max-w-[1000px] mb-5">
      <div className="rounded-3xl px-6 shadow-lg shadow-slate-6">
        <div className="flex w-full flex-row">
          <ProfileMenuContainer />
          <ProfileContext.Provider value={{ editMode, setEditMode }}>
            <div className="mx-5 min-w-[600px]">{children}</div>
          </ProfileContext.Provider>
        </div>
      </div>
    </div>
  )
}

export default ProfileLayout
