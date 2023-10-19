import { profileItems } from "@/utils/profileLinks"
import ProfileMenuItem from "./ProfileMenuItem"

const ProfileMenuContainer = () => {
  return (
    <div className=" border-slate-5 border-r-[1px] pr-5 pt-10 ">
      {profileItems.map((item) => (
        <ProfileMenuItem key={item.title} menuItem={item} />
      ))}
    </div>
  )
}

export default ProfileMenuContainer
