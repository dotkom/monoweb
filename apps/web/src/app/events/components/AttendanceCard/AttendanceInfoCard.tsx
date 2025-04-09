import type { Session } from "@dotkomonline/oauth2/session"
import type { Attendance, AttendancePool } from "@dotkomonline/types"

const AttendanceInfoCard = ({
  attendance,
  pools,
  session,
}: { attendance: Attendance; pools: AttendancePool[]; session: Session }) => {
  return (
    <div>
      <p>{session ? "Du har ikke tilgang på dette arrangementet." : "Logg inn for å melde deg på."}</p>
    </div>
  )
}
