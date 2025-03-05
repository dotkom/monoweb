import BioDisplay from "@/components/molecules/ProfileMolecules/BioDisplay"
import PersonalInfo from "@/components/molecules/ProfileMolecules/PersonalInfo"
import StudyProgressionBox from "@/components/molecules/ProfileMolecules/StudyProgressionBox"
import type { User } from "next-auth"
import type { FC } from "react"

type ProfileInfoBoxProps = {
  user: User
}

const ProfileInfoBox: FC<ProfileInfoBoxProps> = ({ user }) => {
  const lineStyle = "flex flex-1 border-r border-slate-7 justify-center items-center last:border-r-0"
  const bio = true // TODO: Implement fetching bio from user, setting to false if no bio

  return (
    <div className="border-slate-7 mt-9 min-w-[970px] rounded-xl left-0 z-0 w-full border flex flex-row justify-evenly py-16">
      <div className={`min-w-[340px] ${lineStyle}`}>
        <PersonalInfo user={user} />
      </div>
      {bio && (
        <div className={`min-w-[220px] ${lineStyle}`}>
          <BioDisplay
            quote="Most people call me Ho Lee, but you can call me anytime <3. "
            name="Ho Lee Fuk"
            year={2024}
          />
        </div>
      )}
      <div className={`min-w-[410px] ${lineStyle}`}>
        <StudyProgressionBox />
      </div>
    </div>
  )
}

export default ProfileInfoBox
