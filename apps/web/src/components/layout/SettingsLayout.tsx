"use client"
import { settingsItems } from "@/utils/settingsLinks"
import { usePathname } from "next/navigation"
import type { FC, PropsWithChildren } from "react"
import MobileMenuContainer from "../organisms/Navbar/components/profile/ProfileMenu/MobileMenuContainer"
import ProfileMenuContainer from "../organisms/Navbar/components/profile/ProfileMenu/SettingsMenuContainer"

const SettingsLayout: FC<PropsWithChildren> = ({ children }) => {
  const currentSlug = usePathname()
  const currentLink = settingsItems.find((item) => item.slug === currentSlug)

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full border-b-[1px] border-slate-5 py-6 px-4 ">
        <p className=" text-4xl font-bold">{currentLink?.title}</p>
        <p className="text-slate-9 ">{currentLink?.description}</p>
      </div>
      <div className="flex w-full justify-center md:space-x-6 mt-4">
        <ProfileMenuContainer />
        <div className="max-md:w-full w-3/5 max-md:mx-3 border-2 border-slate-5 relative mb-5 rounded-2xl">
          <MobileMenuContainer />
          <div className="md:mt-16 w-full px-4">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default SettingsLayout
