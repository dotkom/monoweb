import { settingsItems } from "@/utils/settingsLinks"
import type { FC } from "react"
import { SettingsMenuItem } from "./SettingsMenuItem"

export const SettingsMenuContainer: FC = () => (
  <div className="w-1/4 h-full border-gray-200 dark:border-stone-800 dark:bg-stone-900 p-3 space-y-3 rounded-xl border max-md:hidden">
    {settingsItems.map((item) => (
      <SettingsMenuItem key={item.title} {...item} />
    ))}
  </div>
)
