import { FC, PropsWithChildren, useState } from "react"
import ProfileMenuContainer from "../organisms/Navbar/components/profile/ProfileMenu/ProfileMenuContainer"
import { ProfileContext } from "../views/ProfileView/context/ProfileContext"

const ProfileLayout: FC<PropsWithChildren> = ({ children }) => {
  const [editMode, setEditMode] = useState(false)

  return (
    <div className="m-x-auto mb-5 max-w-[1000px]">
      <div className="shadow-slate-6 rounded-3xl px-6 shadow-lg">
        <div className="flex w-full flex-row">
          <ProfileMenuContainer />
          <ProfileContext.Provider value={{ editMode, setEditMode }}>
            <div className="mx-5 mt-[42.5px] md:min-w-[600px]">{children}</div>
          </ProfileContext.Provider>
        </div>
      </div>
    </div>
  )
}

export default ProfileLayout
