import { type FC, type PropsWithChildren, useState } from "react";
import { Icon } from "@dotkomonline/ui";
import { usePathname } from "next/navigation";
import { profileItems } from "@/utils/profileLinks";
import MobileMenuContainer from "../organisms/Navbar/components/profile/ProfileMenu/MobileMenuContainer";
import ProfileMenuContainer from "../organisms/Navbar/components/profile/ProfileMenu/ProfileMenuContainer";
import { ProfileContext } from "../views/SettingsView/context/ProfileContext";

interface PageTitleProps {
  title: string;
  icon: string;
}

const PageTitle: FC<PageTitleProps> = ({ title, icon }) => (
  <div className="flex h-10 space-x-2 max-md:hidden">
    <Icon icon={icon} width={"w-10"} />
    <p className="text-3xl">{title}</p>
  </div>
);

const ProfileLayout: FC<PropsWithChildren> = ({ children }) => {
  const currentSlug = usePathname();
  const currentLink = profileItems.find((item) => item.slug === currentSlug);
  const [editMode, setEditMode] = useState(false);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full border-b-[1px] border-slate-5 py-6 px-4 ">
        <p className=" text-4xl font-bold">{currentLink?.title}</p>
        <p className="text-slate-9 ">{currentLink?.description}</p>
      </div>
      <div className="flex space-x-6 mt-4">
        <ProfileMenuContainer />
        <div className="border-2 border-slate-5 relative mb-5 rounded-2xl md:mx-3 ">
          <MobileMenuContainer />
          <ProfileContext.Provider value={{ editMode, setEditMode }}>
            <div className="md:mx-5 md:mt-16 md:w-[750px]">{children}</div>
          </ProfileContext.Provider>
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;
