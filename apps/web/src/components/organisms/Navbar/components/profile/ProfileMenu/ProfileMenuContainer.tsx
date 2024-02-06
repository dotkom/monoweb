import { profileItems } from "@/utils/profileLinks"
import ProfileMenuItem from "./ProfileMenuItem"

const ProfileMenuContainer = () => (
  <div className=" border-slate-5 pr-5 pt-10 max-md:hidden md:border-r-[1px]">
    {profileItems.map((item) => (
      <ProfileMenuItem key={item.title} menuItem={item} />
    ))}
  </div>
)

export default ProfileMenuContainer
