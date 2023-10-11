import { profileItems } from "@/utils/profileLinks"
import ProfileMenuItem from "./ProfileMenuItem"

const ProfileMenuContainer = () => (
    <div className=" border-r-1 border-slate-5 pr-5 pt-[42.5px]">
      {profileItems.map((item) => (
        <ProfileMenuItem key={item.title} menuItem={item} />
      ))}
    </div>
  )

export default ProfileMenuContainer
