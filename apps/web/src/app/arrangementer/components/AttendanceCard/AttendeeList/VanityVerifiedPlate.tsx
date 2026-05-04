import { FlagName } from "@dotkomonline/types"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  cn,
  Text,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@dotkomonline/ui"
import { IconRosetteDiscountCheckFilled, IconUser } from "@tabler/icons-react"
import Link from "next/link.js"
import { GenericPlateUserSection } from "./GenericPlate"
import type { PlateProps } from "./AttendeePlate"

export function VanityVerifiedPlate({ attendee, rightSection, smallIcons, largeIcon }: PlateProps) {
  const resolvedRightSection = rightSection ?? largeIcon

  return (
    <Link
      href={`/profil/${attendee.user.username}`}
      className={cn(
        "flex flex-1 min-w-0 items-center gap-4 px-2 py-1.5 rounded-lg w-full overflow-x-hidden transition-colors",
        "bg-linear-to-r",
        "from-yellow-200 via-yellow-100 hover:from-yellow-300 hover:via-yellow-200 hover:to-yellow-200",
        "dark:from-yellow-500 dark:via-yellow-600 dark:hover:from-yellow-400 dark:hover:via-yellow-500 dark:hover:to-yellow-800"
      )}
    >
      <Avatar className="size-10 shrink-0 outline-2 -outline-offset-1 outline-yellow-500 dark:outline-yellow-600">
        <AvatarImage src={attendee.user.imageUrl ?? undefined} />
        <AvatarFallback className="bg-yellow-400 dark:bg-yellow-700">
          <IconUser className="size-[1.25em]" />
        </AvatarFallback>
      </Avatar>

      <GenericPlateUserSection attendee={attendee} nameClassName="dark:text-black" gradeClassName="dark:text-black">
        {smallIcons}
      </GenericPlateUserSection>

      <div className="min-w-4 flex-1" />

      {resolvedRightSection && <div className="flex shrink-0 items-center justify-center">{resolvedRightSection}</div>}
    </Link>
  )
}

export function getVanityVerifiedSmallIcon() {
  return (
    <Tooltip key={FlagName.VANITY_VERIFIED} delayDuration={100}>
      <TooltipTrigger>
        <IconRosetteDiscountCheckFilled className="size-[1.25em] text-blue-600 dark:text-sky-700" />
      </TooltipTrigger>
      <TooltipContent>
        <Text>OW Verified</Text>
      </TooltipContent>
    </Tooltip>
  )
}
