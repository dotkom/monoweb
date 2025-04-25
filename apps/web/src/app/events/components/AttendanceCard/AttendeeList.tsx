import type { Attendee, User } from "@dotkomonline/types"
import { Avatar, AvatarFallback, Icon, Text } from "@dotkomonline/ui"
import clsx from "clsx"

interface AttendeeListProps {
  attendees: Attendee[]
  maxNumberOfAttendees: number
  userId: User["id"] | undefined
}

export const AttendeeList = ({ attendees, maxNumberOfAttendees, userId }: AttendeeListProps) => {
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

      <div
        className={clsx(
          "flex items-center gap-4 px-3 py-1.5 rounded-lg w-full",
          attendee.userId === userId && "bg-blue-3"
        )}
      >
        <Avatar className="h-10 w-10">
          <AvatarFallback className={attendee.userId === userId ? "bg-blue-6" : "bg-slate-6"}>
            <Icon className="text-lg" icon="tabler:user" />
          </AvatarFallback>
        </Avatar>

        <div>
          <Text className="text-sm">{attendee.displayName}</Text>
          <Text className={clsx("text-xs", attendee.userId === userId ? "text-slate-12" : "text-slate-10")}>
            {attendee.userGrade ? `${attendee.userGrade}. klasse` : "Ingen klasse"}
          </Text>
        </div>
      </div>
    </div>
  ))
}
