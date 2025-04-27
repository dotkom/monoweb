import type { Attendee, User } from "@dotkomonline/types"
import { Avatar, AvatarFallback, Icon, Text } from "@dotkomonline/ui"
import clsx from "clsx"

const getMinWidth = (maxNumberOfAttendees: number) => {
  switch (maxNumberOfAttendees.toString().length) {
    case 1:
      return "min-w-[2ch]"
    case 2:
      return "min-w-[3ch]"
    case 3:
      return "min-w-[4ch]"
    case 4:
      return "min-w-[5ch]"
    default:
      return "min-w-[6ch]"
  }
}

interface AttendeeListProps {
  attendees: Attendee[]
  maxNumberOfAttendees: number
  userId: User["id"] | undefined
  marginOnLastItem?: boolean
}

export const AttendeeList = ({
  attendees,
  maxNumberOfAttendees,
  userId,
  marginOnLastItem = false,
}: AttendeeListProps) => {
  if (!attendees.length) {
    return <Text className="text-slate-10 text-sm">Ingen påmeldte</Text>
  }

  return attendees.map((attendee: Attendee, index) => {
    const isLastItem = index === attendees.length - 1

    return (
      <div
        key={attendee.id}
        className={clsx("flex flex-row gap-1 items-center", marginOnLastItem && isLastItem && "mb-8")}
      >
        <Text className={clsx("text-slate-8 text-right text-sm font-mono", getMinWidth(maxNumberOfAttendees))}>
          {index + 1}.
        </Text>

        <div
          className={clsx("flex items-center gap-4 p-1.5 rounded-lg w-full", attendee.userId === userId && "bg-blue-3")}
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
    )
  })
}
