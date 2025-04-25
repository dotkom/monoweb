import { useTRPC } from "@/utils/trpc/client"
import type { Attendee } from "@dotkomonline/types"
import { Avatar, AvatarFallback, Icon, Text } from "@dotkomonline/ui"
import { useQuery } from "@tanstack/react-query"

interface AttendeesListProps {
  attendanceId: string
}

export const AttendeesList = ({ attendanceId }: AttendeesListProps) => {
  const trpc = useTRPC()
  const { data: attendees = [] } = useQuery(trpc.attendance.getAttendees.queryOptions({ id: attendanceId }))

  if (!attendees.length) {
    return <Text className="text-slate-10 text-sm">Ingen påmeldte</Text>
  }

  // TODO: Implement proper VIP logic to identify the VIP attendee
  // const vipAttendee: Attendee | null = null
  const nonVipAttendees = attendees

  return (
    <div className="flex flex-col gap-4 max-h-[75dvh] overflow-y-auto">
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
      {nonVipAttendees.map((attendee: Attendee) => (
        <div key={attendee.id} className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-slate-6">
                <Icon className="text-lg" icon="tabler:user" />
              </AvatarFallback>
            </Avatar>
            <div>
              <Text className="font-medium">{attendee.displayName}</Text>
              <Text size="sm" className="text-slate-10">
                {attendee.userGrade ? `${attendee.userGrade}. klasse` : "Ingen klasse"}
              </Text>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
