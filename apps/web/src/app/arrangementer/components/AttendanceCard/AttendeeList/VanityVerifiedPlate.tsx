import { cn, Text, Tooltip, TooltipContent, TooltipTrigger } from "@dotkomonline/ui"
import { IconRosetteDiscountCheckFilled } from "@tabler/icons-react"
import { FlagNameSchema, getFlagLabel, type UserFlag } from "@dotkomonline/rpc/user"
import { Plate, type PlateProps } from "./Plate"

export function VanityVerifiedPlate(props: PlateProps) {
  return (
    <Plate
      {...props}
      className={cn(
        "gap-4 overflow-x-hidden rounded-full p-1.75 transition-colors",
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
        <Plate.AttendeeDetails nameClassName="dark:text-black" subtitleClassName="dark:text-black" />
      </Plate.IdentityArea>
      <Plate.AccessoryArea>
        <Plate.BigIcon />
      </Plate.AccessoryArea>
    </Plate>
  )
}

interface VanityVerifiedSmallIconOptions {
  withWhiteBackground?: boolean
  flag: UserFlag
}

export function getVanityVerifiedSmallIcon({ withWhiteBackground = false, flag }: VanityVerifiedSmallIconOptions) {
  const description = flag.description

  let triggerClassName: string | undefined

  if (withWhiteBackground) {
    triggerClassName =
      "relative -my-1 flex size-5 items-center justify-center overflow-hidden rounded-full bg-white p-px leading-none"
  }

  return (
    <Tooltip key={FlagNameSchema.enum.VANITY_VERIFIED} delayDuration={0}>
      <TooltipTrigger className={triggerClassName}>
        <IconRosetteDiscountCheckFilled className="size-[1.25em] text-blue-600 dark:text-sky-700" />
      </TooltipTrigger>
      <TooltipContent>
        <div className="flex flex-col gap-1">
          <Text className="text-xs">{getFlagLabel(FlagNameSchema.enum.VANITY_VERIFIED)}</Text>
          {description !== null && <Text className="text-xs text-muted-foreground">{description}</Text>}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
