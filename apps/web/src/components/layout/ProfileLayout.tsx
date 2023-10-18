import { FC, PropsWithChildren, useState } from "react"
import ProfileMenuContainer from "../organisms/Navbar/components/profile/ProfileMenu/ProfileMenuContainer"
import { ProfileContext } from "../views/ProfileView/context/ProfileContext"
import { profileItems } from "@/utils/profileLinks"
import { Icon } from "@dotkomonline/ui"
import { usePathname } from "next/navigation"

const ProfileLayout: FC<PropsWithChildren> = ({ children }) => {
  const currentLink = profileItems.find((item) => item.slug === usePathname())
  const [editMode, setEditMode] = useState(false)

  return (
    <div className="m-x-auto mb-5 max-w-[1000px]">
      <div className="shadow-slate-6 rounded-3xl px-6 shadow-lg">
        <div className="flex w-full flex-row">
          <ProfileMenuContainer />
          <ProfileContext.Provider value={{ editMode, setEditMode }}>
            <div className="mx-5 mt-[42.5px] md:min-w-[600px]">
              <div className="flex space-x-2">
                <Icon icon={currentLink?.icon} width={24} />
                <p>{currentLink?.title}</p>
              </div>
              {children}
            </div>
          </ProfileContext.Provider>
        </div>
      </div>
    </div>
  )
}

export default ProfileLayout
