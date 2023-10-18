import { FC, PropsWithChildren, useState } from "react"
import ProfileMenuContainer from "../organisms/Navbar/components/profile/ProfileMenu/ProfileMenuContainer"
import { ProfileContext } from "../views/ProfileView/context/ProfileContext"
import { profileItems } from "@/utils/profileLinks"
import { Icon } from "@dotkomonline/ui"
import { usePathname } from "next/navigation"

interface PageTitleProps {
  title: string
  icon: string
}

const PageTitle: FC<PageTitleProps> = ({ title, icon }) => {
  return (
    <div className="flex h-10 space-x-2">
      <Icon icon={icon} width={"w-10"} />
      <p className="text-3xl">{title}</p>
    </div>
  )
}

const ProfileLayout: FC<PropsWithChildren> = ({ children }) => {
  const currentLink = profileItems.find((item) => item.slug === usePathname())
  const [editMode, setEditMode] = useState(false)

  return (
    <div className="m-x-auto mb-5 max-w-[1000px]">
      <div className="shadow-slate-6 rounded-3xl px-6 shadow-lg">
        <div className="flex w-full flex-row">
          <ProfileMenuContainer />
          <ProfileContext.Provider value={{ editMode, setEditMode }}>
            <div className="mx-5 mt-16  md:min-w-[600px]">
              {currentLink ? <PageTitle title={currentLink?.title} icon={currentLink.icon} /> : ""}
              <div className="my-2 ml-5">{children}</div>
            </div>
          </ProfileContext.Provider>
        </div>
      </div>
    </div>
  )
}

export default ProfileLayout
