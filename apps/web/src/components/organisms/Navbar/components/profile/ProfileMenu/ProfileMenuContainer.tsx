import ProfileMenuItem from "./ProfileMenuItem"
import { profileItems } from "@/utils/profileLinks"

const ProfileMenuContainer = () => (
  <div className=" border-slate-5 border-r-[1px] pr-5 pt-10 ">
    {profileItems.map((item) => (
      <ProfileMenuItem key={item.title} menuItem={item} />
    ))}
  </div>
)

export default ProfileMenuContainer
