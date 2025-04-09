import { PersonalInfo } from "@/components/molecules/ProfileMolecules/PersonalInfo"
import { QuoteDisplay } from "@/components/molecules/ProfileMolecules/QuoteDisplay"
import { MembershipBox } from "@/components/molecules/ProfileMolecules/StudyProgressionBox"
import type { User } from "@dotkomonline/types"
import { cn } from "@dotkomonline/ui"
import type { FC } from "react"

type ProfileInfoBoxProps = {
  user: User
}

export const ProfileInfoBox: FC<ProfileInfoBoxProps> = ({ user }) => {
  const lineStyle = "border-r border-slate-7 last:border-r-0"
  const bio = true

  return (
    <div className="border-slate-7 mt-9 min-w-[970px] rounded-xl left-0 z-0 w-full border flex flex-row justify-evenly py-16">
      <div className={cn("min-w-[340px]", lineStyle)}>
        <PersonalInfo user={user} />
      </div>
      {bio && (
        <div className={cn("min-w-[220px] flex items-center", lineStyle)}>
          <QuoteDisplay
            quote="Most people call me Ho Lee, but you can call me anytime <3. "
            name="Ho Lee Fuk"
            year={2024}
          />
        </div>
      )}
      <div className={cn("min-w-[410px] flex justify-evenly flex-col", lineStyle)}>
        <MembershipBox membership={user.membership} />
      </div>
    </div>
  )
}
