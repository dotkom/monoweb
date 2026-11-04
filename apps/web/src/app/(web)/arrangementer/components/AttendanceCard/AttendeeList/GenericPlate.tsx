import { cn } from "@dotkomonline/ui"
import { Plate, type PlateProps } from "./Plate"

export function GenericPlate({ attendee, user, smallIcons, largeIcon, isCurrentUser }: PlateProps) {
  return (
    <Plate
      attendee={attendee}
      user={user}
      smallIcons={smallIcons}
      largeIcon={largeIcon}
      isCurrentUser={isCurrentUser}
      className={cn(
        "gap-4 overflow-x-hidden rounded-full p-1.75 transition-colors",
        !isCurrentUser && "hover:bg-gray-100 dark:hover:bg-stone-700",
        isCurrentUser && "bg-blue-100 hover:bg-blue-200 dark:bg-sky-950 dark:hover:bg-sky-900"
      )}
    >
      <Plate.IdentityArea>
        <Plate.Avatar
          className={cn(isCurrentUser && "outline-2 -outline-offset-1 outline-blue-500 dark:outline-sky-800")}
          fallbackClassName="bg-gray-300 dark:bg-stone-700"
        />
        <Plate.AttendeeDetails
          subtitleClassName={cn(
            !isCurrentUser && "text-gray-900 dark:text-stone-300",
            isCurrentUser && "text-black dark:text-white"
          )}
        />
      </Plate.IdentityArea>
      <Plate.AccessoryArea>
        <Plate.BigIcon />
      </Plate.AccessoryArea>
    </Plate>
  )
}
