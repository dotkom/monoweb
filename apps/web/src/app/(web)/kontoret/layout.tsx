import { MobileNavigationMenu } from "./components/MobileNavigationMenu"
import type { PropsWithChildren } from "react"
import { NavigationMenu } from "./components/NavigationMenu"

export default function KontoretPageLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-row w-full gap-8">
      <NavigationMenu />
      <div className="grow relative">
        <MobileNavigationMenu />
        <div>{children}</div>
      </div>
    </div>
  )
}
