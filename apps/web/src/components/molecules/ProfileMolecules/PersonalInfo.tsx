"use client"

import { Avatar, AvatarFallback, AvatarImage, Button } from "@dotkomonline/ui";
import type { User } from "next-auth";
import Link from "next/link";
import { FC } from "react";

type PersonalInfoProps = {
    user: User;
    className?: string;
};

const PersonalInfo: FC<PersonalInfoProps> = ({ user, className }) => {
    return (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}> 
            <Avatar className="w-40 h-auto opacity-60">
                <AvatarImage src={user.image} alt="UserAvatar" />
                <AvatarFallback className="w-40 h-40">{user.name}</AvatarFallback>
            </Avatar>
            <p className="text-lg">{user.name}</p> 
            <p className="text-lg text-slate-10">{user.email}</p>
            <Button variant="gradient" className="self-auto"> 
                <Link href="/settings">Profil Innstillinger</Link>
            </Button>
            {/* <ChangeAvatar {...user} /> */}
        </div>
    );
};

export default PersonalInfo;
