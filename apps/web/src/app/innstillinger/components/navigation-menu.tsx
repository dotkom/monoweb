"use client"

import { Title } from "@dotkomonline/ui"
import { SettingsMenuItem } from "./settings-menu-item"

export const settingsNavigationItems = [
  {
    slug: "/innstillinger/profil",
    icon: "tabler:user",
    title: "Profil",
  },
  {
    slug: "/innstillinger/personvern",
    icon: "tabler:spy",
    title: "Personvern",
  },
]

export const ProfileNavigationMenu = () => {
  return (
    <section className="flex flex-col min-w-40 w-1/6 h-full gap-3 max-md:hidden">
      <Title element="h1" className="text-base font-semibold text-gray-500 dark:text-stone-500">
        Innstillinger
      </Title>
      <div className="flex flex-col gap-2">
        {settingsNavigationItems.map((item) => (
          <SettingsMenuItem key={item.slug} {...item} />
        ))}
      </div>
    </section>
  )
}
