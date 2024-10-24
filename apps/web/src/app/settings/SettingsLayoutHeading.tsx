"use client"

import { settingsItems } from "@/utils/settingsLinks"
import { usePathname } from "next/navigation"

export const SettingsLayoutHeading = () => {
  const currentSlug = usePathname()
  const currentLink = settingsItems.find((item) => item.slug === currentSlug)

  return <div className="w-full border-b-[1px] border-slate-5 py-6 px-4 ">
    <p className=" text-4xl font-bold">{currentLink?.title}</p>
    <p className="text-slate-9 ">{currentLink?.description}</p>
  </div>

}