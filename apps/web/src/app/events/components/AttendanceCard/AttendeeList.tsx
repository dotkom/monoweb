import type { Attendee } from "@dotkomonline/types"
import { Avatar, AvatarFallback, Icon, Text } from "@dotkomonline/ui"

interface AttendeeListProps {
  attendees: Attendee[]
}

export const AttendeeList = ({ attendees }: AttendeeListProps) => {
  if (!attendees.length) {
    return <Text className="text-slate-10 text-sm">Ingen påmeldte</Text>
  }
  return attendees.map((attendee: Attendee) => (
    <div key={attendee.id} className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-slate-6">
            <Icon className="text-lg" icon="tabler:user" />
          </AvatarFallback>
        </Avatar>
        <div>
          <Text>{attendee.displayName}</Text>
          <Text size="sm" className="text-slate-10">
            {attendee.userGrade ? `${attendee.userGrade}. klasse` : "Ingen klasse"}
          </Text>
        </div>
      </div>
    </div>
  ))
}
