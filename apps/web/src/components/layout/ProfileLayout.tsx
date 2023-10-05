import { type FC, type PropsWithChildren, useState } from "react";

import ProfileMenuContainer from "../organisms/Navbar/components/profile/ProfileMenu/ProfileMenuContainer";
import { ProfileContext } from "../views/ProfileView/context/ProfileContext";

const ProfileLayout: FC<PropsWithChildren> = ({ children }) => {
    const [editMode, setEditMode] = useState(false);

    return (
        <div className="m-x-auto max-w-[1000px]">
            <h1>Profil</h1>
            <hr />
            <div className="mt-[42.5px] flex w-full flex-row">
                <ProfileMenuContainer />
                <ProfileContext.Provider value={{ editMode, setEditMode }}>
                    <div className="mx-5 min-w-[600px]">{children}</div>
                </ProfileContext.Provider>
            </div>
        </div>
    );
};

export default ProfileLayout;
