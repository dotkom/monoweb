import { cn, Text, Tooltip, TooltipContent, TooltipTrigger } from "@dotkomonline/ui"
import { IconRosetteDiscountCheckFilled } from "@tabler/icons-react"
import { FlagNameSchema, getFlagLabel, type UserFlag } from "@dotkomonline/rpc/user"
import { Plate, type PlateProps } from "./Plate"
import styles from "./PlateBackground.module.css"

export function VanityVerifiedPlate(props: PlateProps) {
  return (
    <Plate {...props} className={cn("gap-4 overflow-x-hidden rounded-full p-1.75", styles.background, styles.verified)}>
      <Plate.IdentityArea>
        <Plate.Avatar
          className="outline-2 outline-yellow-500 dark:outline-yellow-600"
          fallbackClassName="bg-yellow-400/50 dark:bg-yellow-700/50"
        />
        <Plate.AttendeeDetails subtitleClassName="text-muted-foreground" />
      </Plate.IdentityArea>
      <Plate.AccessoryArea>
        <Plate.BigIcon />
      </Plate.AccessoryArea>
    </Plate>
  )
}

interface VanityVerifiedSmallIconOptions {
  withWhiteBackground?: boolean
  flag: Pick<UserFlag, "description">
}

export function getVanityVerifiedSmallIcon({ withWhiteBackground = false, flag }: VanityVerifiedSmallIconOptions) {
  const description = flag.description

  const triggerClassName = cn(
    "relative inline-flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full p-0 leading-none",
    withWhiteBackground && "bg-white"
  )

  return (
    <Tooltip key={FlagNameSchema.enum.VANITY_VERIFIED} delayDuration={0}>
      <TooltipTrigger className={triggerClassName}>
        <IconRosetteDiscountCheckFilled className="block size-4.5 shrink-0 text-blue-600 dark:text-sky-700" />
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
