import PersonalInfo from "@/components/molecules/ProfileMolecules/PersonalInfo"
import { PersonIcon } from "@radix-ui/react-icons"
import type { User } from "next-auth"
import { FC } from "react"

type ProfileInfoBoxProps = {
    user: User
}

const ProfileInfoBox: FC<ProfileInfoBoxProps> = ({ user }) => {
    return (
        <div className="border-slate-7 left-0 z-0 w-full border">
            <PersonalInfo user={user} />
        </div>
    )
}

export default ProfileInfoBox