"use client"

import { MobileMenuContainer } from "@/components/Navbar/MobileMenuContainer"
import { SettingsMenuContainer } from "@/components/Navbar/SettingsMenuContainer"
import { settingsItems } from "@/utils/settingsLinks"
import { Text, Title } from "@dotkomonline/ui"
import { usePathname } from "next/navigation"
import type { PropsWithChildren } from "react"

export default function SettingsPageLayout({ children }: PropsWithChildren) {
  const currentSlug = usePathname()
  const currentLink = settingsItems.find((item) => item.slug === currentSlug)

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full border-b-[1px] border-gray-400 py-6 px-4 ">
        <Title size="xl">{currentLink?.title}</Title>
        <Text>{currentLink?.description}</Text>
      </div>
      <div className="flex w-full justify-center md:space-x-6 mt-4">
        <SettingsMenuContainer />
        <div className="max-md:w-full w-3/5 max-md:mx-3 border-2 border-gray-400 relative mb-5 rounded-2xl">
          <MobileMenuContainer />
          <div className="md:mt-16 w-full px-4">{children}</div>
        </div>
      </div>
    </div>
  )
}
