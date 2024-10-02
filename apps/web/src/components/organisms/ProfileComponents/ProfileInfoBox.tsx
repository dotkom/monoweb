import PersonalInfo from "@/components/molecules/ProfileMolecules/PersonalInfo"
import QuoteDisplay from "@/components/molecules/ProfileMolecules/QuoteDisplay"
import StudyProgressionBox from "@/components/molecules/ProfileMolecules/StudyProgressionBox"
import { PersonIcon } from "@radix-ui/react-icons"
import type { User } from "next-auth"
import { FC } from "react"

type ProfileInfoBoxProps = {
    user: User
}

const ProfileInfoBox: FC<ProfileInfoBoxProps> = ({ user }) => {
    const lineStyle = "flex flex-1 border-r border-slate-7 last:border-r-0"
    const quote = true

    return (
        <div className="border-slate-7 left-0 z-0 w-full border flex flex-row justify-evenly p-10">
            <div className={lineStyle}>
                <PersonalInfo user={user} />
            </div>
            {quote && (
                <div className={lineStyle}>
                    <QuoteDisplay quote="Most people call me Ho Lee, but you can call me anytime <3. " name="Ho Lee Fuk" year={2024} />
                </div>                
            )}
            <div className={lineStyle}>
                <StudyProgressionBox />
            </div>
        </div>  
    )
}

export default ProfileInfoBox