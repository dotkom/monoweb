import { Attendee, User } from "@dotkomonline/types"
import { cn, Text } from "@dotkomonline/ui"
import { getAttendeePlate } from "./AttendeePlate"

interface AttendeeListProps {
  attendees: Attendee[]
  user: User
  maxNumberOfAttendees: number
}

export const AttendeeList = ({ attendees, user, maxNumberOfAttendees }: AttendeeListProps) => {
  if (!attendees.length) {
    return <Text className="text-gray-900 text-sm mx-2">Ingen påmeldte</Text>
  }

  return attendees.map((attendee, index) => {
    const Plate = getAttendeePlate(attendee)
    const minWidth = getMinWidth(maxNumberOfAttendees)

    return (
      <div key={attendee.id} className="flex flex-row gap-1 items-center group">
        <Text
          style={{ minWidth }}
          className={cn(
            "text-gray-400 group-hover:text-black dark:text-stone-500 dark:group-hover:text-stone-300",
            "text-right text-sm font-mono transition-colors"
          )}
        >
          {index + 1}.
        </Text>

        <Plate attendee={attendee} user={user} />
      </div>
    )
  })
}

function getMinWidth(maxNumberOfAttendees: number) {
  const value = maxNumberOfAttendees.toString().length

  return `${value}ch`
}
