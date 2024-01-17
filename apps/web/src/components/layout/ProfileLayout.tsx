import { type FC, type PropsWithChildren, useState } from "react"
import { Icon } from "@dotkomonline/ui"
import { usePathname } from "next/navigation"
import { profileItems } from "@/utils/profileLinks"
import MobileMenuContainer from "../organisms/Navbar/components/profile/ProfileMenu/MobileMenuContainer"
import ProfileMenuContainer from "../organisms/Navbar/components/profile/ProfileMenu/ProfileMenuContainer"
import { ProfileContext } from "../views/ProfileView/context/ProfileContext"

interface PageTitleProps {
  title: string
  icon: string
}

const PageTitle: FC<PageTitleProps> = ({ title, icon }) => (
  <div className="flex h-10 space-x-2 max-md:hidden">
    <Icon icon={icon} width={"w-10"} />
    <p className="text-3xl">{title}</p>
  </div>
)

const ProfileLayout: FC<PropsWithChildren> = ({ children }) => {
  const currentSlug = usePathname()
  const currentLink = profileItems.find((item) => item.slug === currentSlug)
  const [editMode, setEditMode] = useState(false)

  return (
    <div className="m-x-auto shadow-slate-6 relative mb-5 max-w-[1000px] rounded-3xl p-5 shadow-lg max-md:w-[90vw] md:mx-3 ">
      <div className="md:flex">
        <MobileMenuContainer />
        <ProfileMenuContainer />
        <ProfileContext.Provider value={{ editMode, setEditMode }}>
          <div className="md:mx-5 md:mt-16 md:w-[550px]">
            {currentLink && <PageTitle title={currentLink?.title} icon={currentLink.icon} />}
            <div className="my-2 md:ml-5 ">{children}</div>
          </div>
        </ProfileContext.Provider>
      </div>
    </div>
  )
}

export default ProfileLayout
