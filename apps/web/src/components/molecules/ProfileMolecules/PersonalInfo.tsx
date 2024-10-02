"use client"

import ProfilePicture from "@/components/atoms/ProfileAtom/ProfilePicture";
import { Button } from "@dotkomonline/ui";
import type { User } from "next-auth";
import { FC } from "react";

type PersonalInfoProps = {
    user: User;
};

const PersonalInfo: FC<PersonalInfoProps> = ({ user }) => {
    return (
        <div className="flex flex-col items-center p-10"> 
            <ProfilePicture className="mb-3" defaultImage={"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"} />
            <p className="text-lg mb-3">{user.name}</p> 
            <p className="text-lg mb-3 text-slate-10">{user.email}</p>
            <Button variant="gradient" className="self-auto"> 
                Profil Innstillinger
            </Button>
        </div>
    );
};

export default PersonalInfo;
