import { cn, Text, Tooltip, TooltipContent, TooltipTrigger } from "@dotkomonline/ui"
import { IconRosetteDiscountCheckFilled } from "@tabler/icons-react"
import { FlagName, getFlagLabel } from "@dotkomonline/rpc/user"
import { Plate, type PlateProps } from "./Plate"

export function VanityVerifiedPlate(props: PlateProps) {
  return (
    <Plate
      {...props}
      className={cn(
        "gap-4 overflow-x-hidden rounded-lg px-2 py-1.5 transition-colors",
        "bg-linear-to-r",
        "from-yellow-200 via-yellow-100 hover:from-yellow-300 hover:via-yellow-200 hover:to-yellow-200",
        "dark:from-yellow-500 dark:via-yellow-600 dark:hover:from-yellow-400 dark:hover:via-yellow-500 dark:hover:to-yellow-800"
      )}
    >
      <Plate.IdentityArea>
        <Plate.Avatar
          className="outline-2 -outline-offset-1 outline-yellow-500 dark:outline-yellow-600"
          fallbackClassName="bg-yellow-400 dark:bg-yellow-700"
        />
        <Plate.AttendeeDetails nameClassName="dark:text-black" gradeClassName="dark:text-black" />
      </Plate.IdentityArea>
      <Plate.AccessoryArea>
        <Plate.BigIcon />
      </Plate.AccessoryArea>
    </Plate>
  )
}

export function getVanityVerifiedSmallIcon() {
  return (
    <Tooltip key={FlagName.VANITY_VERIFIED} delayDuration={100}>
      <TooltipTrigger>
        <IconRosetteDiscountCheckFilled className="size-[1.25em] text-blue-600 dark:text-sky-700" />
      </TooltipTrigger>
      <TooltipContent>
        <Text>{getFlagLabel(FlagName.VANITY_VERIFIED)}</Text>
      </TooltipContent>
    </Tooltip>
  )
}
