import { profileItems } from "@/utils/profileLinks"
import ProfileMenuItem from "./ProfileMenuItem"

const ProfileMenuContainer = () => {
  return (
    <div className=" pt-[42.5px] border-r-[1px] border-slate-5 pr-5">
      {profileItems.map((item) => (
        <ProfileMenuItem key={item.title} menuItem={item} />
      ))}
    </div>
  )
}

export default ProfileMenuContainer
