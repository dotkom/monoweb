import { useTRPC } from "@/utils/trpc/client"
import type { AttendancePool, Attendee } from "@dotkomonline/types"
import { Icon } from "@dotkomonline/ui"
import { useQuery } from "@tanstack/react-query"

interface AttendeesListProps {
  attendanceId: string
}

export const AttendeesList = ({ attendanceId }: AttendeesListProps) => {
  const trpc = useTRPC()
  const { data: attendees = [] } = useQuery(trpc.attendance.getAttendees.queryOptions({ id: attendanceId }))
  const { data: attendance } = useQuery(trpc.attendance.getAttendance.queryOptions({ id: attendanceId }))

  if (!attendees || !attendance) {
    return null
  }

  const displayPools = attendance.pools
  // TODO: Implement proper VIP logic to identify the VIP attendee
  // const vipAttendee = undefined as Attendee | undefined
  const nonVipAttendees = attendees

  return (
    <div className="flex flex-col gap-4">
      {/* VIP section - to be implemented
      {vipAttendee && (
        <div className="flex flex-col gap-2">
          <h3 className="font-medium">VIP</h3>
          <div className="flex items-center justify-between rounded-lg border border-slate-6 p-3 hover:bg-slate-2">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-4">
                <Icon className="text-lg" icon="tabler:user" />
              </div>
              <div>
                <div className="font-medium">{vipAttendee.displayName}</div>
                <div className="text-sm text-slate-11">
                  {vipAttendee.userGrade ? `${vipAttendee.userGrade}. klasse` : "Ingen klasse"}
                </div>
              </div>
            </div>
            <div className="text-sm text-slate-11">
              {displayPools.find((p: AttendancePool) => p.id === vipAttendee.attendancePoolId)?.title}
            </div>
          </div>
        </div>
      )}
      */}

      <div className="flex flex-col gap-2">
        <h3 className="font-medium">Påmeldte</h3>
        {nonVipAttendees.map((attendee: Attendee) => {
          const pool = displayPools.find((p: AttendancePool) => p.id === attendee.attendancePoolId)
          return (
            <div
              key={attendee.id}
              className="flex items-center justify-between rounded-lg border border-slate-6 p-3 hover:bg-slate-2"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-4">
                  <Icon className="text-lg" icon="tabler:user" />
                </div>
                <div>
                  <div className="font-medium">{attendee.displayName}</div>
                  <div className="text-sm text-slate-11">
                    {attendee.userGrade ? `${attendee.userGrade}. klasse` : "Ingen klasse"}
                  </div>
                </div>
              </div>
              <div className="text-sm text-slate-11">{pool?.title}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
