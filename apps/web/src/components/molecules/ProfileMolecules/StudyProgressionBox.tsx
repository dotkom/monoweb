import type { Membership } from "@dotkomonline/types"
import { getMembershipGrade } from "@dotkomonline/types"
import { Button } from "@dotkomonline/ui"
import Link from "next/link"
import type { FC } from "react"

function membershipDescription(membership: Membership) {
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

type MembershipBoxProps = {
  membership: Membership | null
}

export const MembershipBox: FC<MembershipBoxProps> = ({ membership }) => {
  if (membership === null) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-full">
        <p className="text-3xl">Ingen medlemsskap</p>

        <Link href="/api/auth/authorize?connection=FEIDE&redirectAfter=/profile">
          <Button color="gradient">Bekreft med FEIDE</Button>
        </Link>
      </div>
    )
  }
  const grade = getMembershipGrade(membership)

  return (
    <div className={"flex flex-col items-center justify-center gap-3"}>
      {grade && <p className="text-3xl">{grade}. klasse</p>}
      <p className="text-3xl">{membershipDescription(membership)}</p>
    </div>
  )
}
