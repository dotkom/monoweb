import { profileItems } from "@/utils/profileLinks";
import ProfileMenuItem from "./ProfileMenuItem";

const ProfileMenuContainer = () => (
  <div className=" h-fit border-slate-5 p-3 space-y-3 min-w-[20rem] rounded-2xl border-2 max-md:hidden">
    {profileItems.map((item) => (
      <ProfileMenuItem key={item.title} menuItem={item} />
    ))}
  </div>
);

export default ProfileMenuContainer;
