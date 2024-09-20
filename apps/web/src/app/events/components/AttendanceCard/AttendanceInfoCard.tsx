import type { Attendance, AttendancePool } from "@dotkomonline/types"
import type { Session } from "next-auth"

const AttendanceInfoCard = ({
  attendance,
  pools,
  sessionUser,
}: { attendance: Attendance; pools: AttendancePool[]; sessionUser: Session["user"] }) => {
  return (
    <div>
      <p>{sessionUser ? "Du har ikke tilgang på dette arrangementet." : "Logg inn for å melde deg på."}</p>
    </div>
  )
}
