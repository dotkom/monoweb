import type { Attendee } from "@dotkomonline/types"
import { Avatar, AvatarFallback, Icon, Text } from "@dotkomonline/ui"
import clsx from "clsx"

interface AttendeeListProps {
  attendees: Attendee[]
  maxNumberOfAttendees: number
}

export const AttendeeList = ({ attendees, maxNumberOfAttendees }: AttendeeListProps) => {
  if (!attendees.length) {
    return <Text className="text-slate-10 text-sm">Ingen påmeldte</Text>
  }

  return attendees.map((attendee: Attendee, index) => (
    <div key={attendee.id} className="flex flex-row gap-2 items-center">
      <Text
        className={clsx(
          "text-slate-8 text-right text-sm font-mono",
          `min-w-[${maxNumberOfAttendees.toString().length + 1}ch]`
        )}
      >
        {index + 1}.
      </Text>

      <div className="flex flex-row items-center gap-4">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-slate-6">
            <Icon className="text-lg" icon="tabler:user" />
          </AvatarFallback>
        </Avatar>

        <div>
          <Text className="text-sm">{attendee.displayName}</Text>
          <Text className="text-slate-10 text-xs">
            {attendee.userGrade ? `${attendee.userGrade}. klasse` : "Ingen klasse"}
          </Text>
        </div>
      </div>
    </div>
  ))
}
