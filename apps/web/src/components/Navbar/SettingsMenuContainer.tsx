import { settingsItems } from "@/utils/settingsLinks"
import type { FC } from "react"
import { SettingsMenuItem } from "./SettingsMenuItem"

export const SettingsMenuContainer: FC = () => (
  <div className=" w-1/4 h-fit border-slate-6 p-3 space-y-3 rounded-2xl border-2 max-md:hidden">
    {settingsItems.map((item) => (
      <SettingsMenuItem key={item.title} {...item} />
    ))}
  </div>
)
