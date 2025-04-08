import type { FC } from "react"
import StudentProgress from "../StudentProgress/StudentProgress"
import type { Membership, User } from "@dotkomonline/types"
import { getMembershipGrade } from "@dotkomonline/types"

function memberDescription(membership: Membership) {
  switch (membership.type) {
    case "BACHELOR":
      return "Bachelor"
    case "MASTER":
      return "Master"
    case "SOCIAL":
      return "Sosialt medlem"
    case "KNIGHT":
      return "Ridder"
  }
}

type StudyProgressionBoxProps = {
  className?: string
  user: User
}

const StudyProgressionBox: FC<StudyProgressionBoxProps> = ({ className, user }) => {
  if (!user.membership) {
    return null
  }

  const grade = getMembershipGrade(user.membership);

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className ?? ""}`}>
      { grade && <p className="text-3xl">{grade}. klasse</p> }
      <p className="text-3xl">{memberDescription(user.membership)}</p>
      <div className="transform scale-90">
        { grade && <StudentProgress year={grade} /> }
      </div>
    </div>
  )
}

export default StudyProgressionBox
