import { useTRPC } from "@/utils/trpc/client"
import type { AttendancePool, Attendee } from "@dotkomonline/types"
import { Avatar, AvatarFallback, Icon, Text } from "@dotkomonline/ui"
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

  // Group attendees by their pool
  const attendeesByPool = displayPools.map((pool: AttendancePool) => ({
    ...pool,
    attendees: nonVipAttendees.filter((attendee: Attendee) => attendee.attendancePoolId === pool.id),
  }))

  return (
    <div className="flex flex-col gap-4">
      {/* VIP section - to be implemented
      {vipAttendee && (
        <div className="flex flex-col gap-2">
          <h3 className="font-medium">VIP</h3>
          <Card className="p-3 hover:bg-slate-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    <Icon className="text-lg" icon="tabler:user" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Text size="md" className="font-medium">{vipAttendee.displayName}</Text>
                  <Text size="sm" className="text-slate-11">
                    {vipAttendee.userGrade ? `${vipAttendee.userGrade}. klasse` : "Ingen klasse"}
                  </Text>
                </div>
              </div>
              <Text size="sm" className="text-slate-11">
                {displayPools.find((p: AttendancePool) => p.id === vipAttendee.attendancePoolId)?.title}
              </Text>
            </div>
          </Card>
        </div>
      )}
      */}

      {attendeesByPool.map((pool) => (
        <div key={pool.id} className="flex flex-col w-full rounded-lg bg-slate-3">
          <div className="px-4 py-3 bg-slate-5 rounded-t-lg text-center text-sm font-bold">{pool.title}</div>
          <div className="px-4 py-4 rounded-b-lg flex flex-col gap-2">
            {pool.attendees.map((attendee: Attendee) => (
              <div key={attendee.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      <Icon className="text-lg" icon="tabler:user" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Text size="md" className="font-medium">
                      {attendee.displayName}
                    </Text>
                    <Text size="sm" className="text-slate-11">
                      {attendee.userGrade ? `${attendee.userGrade}. klasse` : "Ingen klasse"}
                    </Text>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
