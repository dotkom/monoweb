import { profileItems } from "@/utils/profileLinks";

import ProfileMenuItem from "./ProfileMenuItem";

const ProfileMenuContainer = () => (
    <div>
        {profileItems.map((item) => (
            <ProfileMenuItem key={item.title} menuItem={item} />
        ))}
    </div>
);

export default ProfileMenuContainer;
