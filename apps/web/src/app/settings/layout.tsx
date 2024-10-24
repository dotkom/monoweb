import { MobileMenuContainer } from "@/components/organisms/Navbar/components/profile/ProfileMenu/MobileMenuContainer"
import SettingsMenuContainer from "@/components/organisms/Navbar/components/profile/ProfileMenu/SettingsMenuContainer"
import type { PropsWithChildren } from "react"
import { SettingsLayoutHeading } from "./SettingsLayoutHeading"

export default function SettingsPageLayout({ children }: PropsWithChildren) {
  return (
    <div className="w-full flex flex-col items-center">
      <SettingsLayoutHeading />
      <div className="flex w-full md:space-x-6 mt-4">
        <SettingsMenuContainer/>
        <div className="max-md:w-full w-3/5 max-md:mx-3 border-2 border-slate-5 relative mb-5 rounded-2xl">
          <MobileMenuContainer />
          <div className="w-full p-6 px-10">{children}</div>
        </div>
      </div>
    </div>
  )
}
