import type { PropsWithChildren } from "react"
import { MobileProfileNavigationMenu } from "@/app/innstillinger/components/mobile-navigation-menu"
import { ProfileNavigationMenu } from "./components/navigation-menu"

export default function SettingsPageLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-w-0 flex-row w-full gap-8">
      <ProfileNavigationMenu />
      <div className="relative min-w-0 flex-1">
        <MobileProfileNavigationMenu />
        <div>{children}</div>
      </div>
    </div>
  )
}
