import type { PropsWithChildren } from "react"
import { MobileProfileNavigationMenu } from "@/app/innstillinger/components/mobile-navigation-menu"
import { ProfileNavigationMenu } from "./components/navigation-menu"

export default function SettingsPageLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-row w-full gap-4">
      <ProfileNavigationMenu />
      <div className="grow relative">
        <MobileProfileNavigationMenu />
        <div>{children}</div>
      </div>
    </div>
  )
}
