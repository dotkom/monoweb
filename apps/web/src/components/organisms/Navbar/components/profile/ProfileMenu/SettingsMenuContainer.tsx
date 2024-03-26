import { settingsItems } from "@/utils/settingsLinks"
import SettingsMenuItem from "./SettingsMenuItem"

const SettingsMenuContainer = () => (
  <div className=" h-fit border-slate-5 p-3 space-y-3 min-w-[20rem] rounded-2xl border-2 max-md:hidden">
    {settingsItems.map((item) => (
      <SettingsMenuItem key={item.title} menuItem={item} />
    ))}
  </div>
)

export default SettingsMenuContainer
