"use client"

import { IconMapPin2, IconSofa } from "@tabler/icons-react"
import { MenuItem } from "./MenuItem"

export const navigationItems = [
  {
    slug: "/a4/om-a4",
    icon: IconMapPin2,
    title: "Om A4",
  },
  {
    slug: "/a4/kontoret",
    icon: IconSofa,
    title: "Kontoret",
  },
]

export const NavigationMenu = () => {
  return (
    <section className="flex flex-col min-w-40 w-1/6 h-full p-4 gap-3 max-md:hidden border-gray-200 dark:border-stone-700 border-2 rounded-xl ">
      <div className="flex flex-col gap-2">
        {navigationItems.map((item) => (
          <MenuItem key={item.slug} {...item} />
        ))}
      </div>
    </section>
  )
}
