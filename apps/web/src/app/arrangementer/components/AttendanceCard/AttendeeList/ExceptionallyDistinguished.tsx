import { FlagName, getFlagLabel, type Attendee, type UserFlag } from "@dotkomonline/types"
import {
  PopoverClose,
  Avatar,
  AvatarFallback,
  AvatarImage,
  cn,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Text,
  Tilt,
  Title,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@dotkomonline/ui"
import { IconUser, IconX } from "@tabler/icons-react"
import Link from "next/link.js"
import type { PropsWithChildren } from "react"
import { GenericPlateUserSection } from "./GenericPlate"
import Image from "next/image"
import type { PlateProps } from "./AttendeePlate"

const ExceptionallyDistinguishedProfileLink = ({ attendee, children }: PropsWithChildren<{ attendee: Attendee }>) => (
  <Link
    href={`/profil/${attendee.user.username}`}
    className="relative z-20 flex min-w-0 items-center gap-4 px-2 py-[5px]"
  >
    <Avatar className="relative size-10 shrink-0 shadow-[0_0_0_2px_rgba(255,255,255,.15)]">
      <AvatarImage src={attendee.user.imageUrl ?? undefined} />
      <AvatarFallback className="bg-white/25 text-white">
        <IconUser className="size-[1.25em]" />
      </AvatarFallback>
    </Avatar>

    {children}
  </Link>
)

const ExceptionallyDistinguishedRightSection = ({ children }: PropsWithChildren) => (
  <div className="relative z-10 flex shrink-0 items-center justify-center pr-2">{children}</div>
)

export function ExceptionallyDistinguishedPlate({ attendee, rightSection, smallIcons, largeIcon }: PlateProps) {
  const resolvedRightSection = rightSection ?? largeIcon

  return (
    <div
      className={cn(
        "group relative flex w-full items-stretch rounded-lg p-px",
        "transition-all duration-300",
        "bg-[linear-gradient(135deg,#07313b_0%,#0b4b5a_28%,#177087_52%,#0a3d4a_76%,#04242c_100%)]",
        "dark:bg-[linear-gradient(135deg,#0c3d49_0%,#0e4c5c_28%,#145f73_52%,#0d4654_76%,#0a3540_100%)]",
        "shadow-[0_0_0_1px_rgba(7,49,59,0.35),0_0_8px_rgba(12,74,97,0.24)]",
        "hover:shadow-[0_0_0_1px_rgba(23,112,135,0.42),0_0_12px_rgba(12,74,97,0.32)]"
      )}
    >
      <div
        className={cn(
          "relative flex w-full min-w-0 flex-1 items-center overflow-hidden rounded-[7px]",
          "bg-origin-border",
          "bg-[linear-gradient(rgb(12_74_97),rgb(12_74_97)),linear-gradient(to_right,#c8a03c_0%,#dbb84a_35%,#f0cc58_68%,#f8de76_100%)]",
          "[background-clip:padding-box,border-box]",
          "dark:bg-[linear-gradient(rgb(8_46_63),rgb(8_46_63)),linear-gradient(to_right,#8c6a28_0%,#aa8234_35%,#c29844_68%,#d4aa50_100%)]"
        )}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[6px]">
          <div className="absolute inset-0 left-[calc(33%+var(--spacing)*8)] flex items-center justify-center opacity-[0.13] transition-opacity duration-300 group-hover:opacity-25">
            <div className="w-20 rotate-270">
              <ExceptionallyDistinguishedLeaf className="fill-white" />
            </div>
          </div>
        </div>

        <ExceptionallyDistinguishedProfileLink attendee={attendee}>
          <GenericPlateUserSection
            attendee={attendee}
            nameClassName="font-medium text-orange-200"
            gradeClassName="text-white"
          >
            {smallIcons}
          </GenericPlateUserSection>
        </ExceptionallyDistinguishedProfileLink>

        <div className="min-w-4 flex-1" />

        {resolvedRightSection && (
          <ExceptionallyDistinguishedRightSection>{resolvedRightSection}</ExceptionallyDistinguishedRightSection>
        )}
      </div>
    </div>
  )
}

function getIconContent(exceptionallyDistinguishedFlags: UserFlag[]) {
  if (exceptionallyDistinguishedFlags.length === 0) {
    return null
  }

  return (
    <>
      {exceptionallyDistinguishedFlags[0].imageUrl && (
        <div className="mt-2 flex w-full items-center justify-center">
          <Image
            src={exceptionallyDistinguishedFlags[0].imageUrl}
            alt={getFlagLabel(exceptionallyDistinguishedFlags[0].name as FlagName)}
            width={200}
            height={200}
            className="rounded-full shimmer"
          />
        </div>
      )}
      {exceptionallyDistinguishedFlags[0].description && (
        <Text className="text-xs text-gray-500 dark:text-stone-500">
          {exceptionallyDistinguishedFlags[0].description}
        </Text>
      )}
    </>
  )
}

export function getExceptionallyDistinguishedLargeIcon(exceptionallyDistinguishedFlags: UserFlag[]) {
  const exceptionallyDistinguishedFlag = exceptionallyDistinguishedFlags.at(0)

  if (exceptionallyDistinguishedFlag === undefined) {
    return null
  }

  const triggerClassName = "relative h-fit rounded-full bg-[#fffbf2] p-1 shadow-[0_0_12px_rgba(245,183,66,.65)]"

  const triggerContent = (
    <div
      className={cn(
        "size-9 shrink-0 overflow-hidden rounded-full shimmer",
        "shadow-[0_0_0_2px_rgba(201,168,76,0.85),0_0_14px_rgba(201,168,76,0.5)]"
      )}
    >
      {exceptionallyDistinguishedFlag.imageUrl ? (
        <Image
          src={exceptionallyDistinguishedFlag.imageUrl}
          alt="Særskilt utmerket"
          width={36}
          height={36}
          className="size-full object-cover"
        />
      ) : (
        <div className="flex size-full items-center justify-center bg-accent text-[10px] font-bold text-brand">SU</div>
      )}
    </div>
  )

  if (exceptionallyDistinguishedFlags.length === 0) {
    return triggerContent
  }

  return (
    <Popover key={FlagName.EXCEPTIONALLY_DISTINGUISHED}>
      <Tilt scale={1.05} tiltMaxAngleX={8} tiltMaxAngleY={8} glareMaxOpacity={0.2} className="rounded-full">
        <PopoverTrigger className={triggerClassName}>{triggerContent}</PopoverTrigger>
      </Tilt>
      <PopoverContent side="left" className="flex w-64 flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <Title element="p">Særskilt utmerket</Title>
          <PopoverClose className="rounded p-0.5 transition-colors hover:bg-gray-100 dark:hover:bg-stone-600">
            <IconX className="size-4 text-gray-500 dark:text-stone-400" />
          </PopoverClose>
        </div>
        {getIconContent(exceptionallyDistinguishedFlags)}
      </PopoverContent>
    </Popover>
  )
}

export function getExceptionallyDistinguishedSmallIcon(exceptionallyDistinguishedFlags: UserFlag[]) {
  const triggerClassName = "relative h-fit rounded-full bg-[#fffbf2] p-0.5 -my-1 shadow-[0_0_12px_rgba(245,183,66,.65)]"
  const imageUrl = exceptionallyDistinguishedFlags.at(0)?.imageUrl

  const triggerContent = (
    <Avatar className="size-5 ring-1 ring-accent ring-offset-1 shimmer shadow-[0_0_10px_rgba(245,183,66,.25)]">
      <AvatarImage src={imageUrl ?? undefined} />
      <AvatarFallback>
        <Text
          element="div"
          className="flex h-full w-full items-center justify-center bg-accent text-[9px] font-semibold text-brand"
        >
          SU
        </Text>
      </AvatarFallback>
    </Avatar>
  )

  if (exceptionallyDistinguishedFlags.length === 0) {
    return triggerContent
  }

  return (
    <Tooltip key={FlagName.EXCEPTIONALLY_DISTINGUISHED} delayDuration={100}>
      <TooltipTrigger className={triggerClassName}>{triggerContent}</TooltipTrigger>
      <TooltipContent>
        <div className="flex max-w-xs flex-col gap-2">
          <Title element="p">Særskilt utmerket</Title>
          {getIconContent(exceptionallyDistinguishedFlags)}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

interface ExceptionallyDistinguishedLeafProps {
  className?: string
}

function ExceptionallyDistinguishedLeaf({ className }: ExceptionallyDistinguishedLeafProps) {
  return (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 239.14 880.83">
      <g>
        <path
          className={cn("fill-white", className)}
          d="m210.6,626.18c-18.92,48.03-75.12,123.71-80.16,131.02-5.04,7.31-20.43,31.96-26.17,47.93-5.83,16.23-6.81,28.64-8.64,44.33-1.86,15.97-.99,17.4-.99,28.9,0,3.56-7.25,3.02-7.25,0,0-2.67,0-7.19-.58-13.25s-5.88-15.3-13.48-22.53c-8.45-8.03-20.78-21.42-26.86-30.68-10.48-15.43-20.8-30.92-28.92-47.03-10.11-20.06-15.13-39.54-16.88-60.91-2.21-27.34,1.4-54.78,6.23-81.93-.85,30.4,15.03,52.63,33.66,73.28,24.26,26.9,33.46,58.37,30.3,93.93-.45,4.97-2.05,29.3-1.78,37.8.04,1.38.5,2.72,1.36,3.8,1.86,2.32,4.44,4.95,6.83,7.04s6.61,6.09,10.33,11.7c.65-6.24,3.17-32.45,8.84-47.78,5.55-15.04,21.45-38.55,22.05-39.42,0-.02.01-.03.01-.03,2.04-3.5,3.59-6.29,3.56-7.03-1.19-27.69-13.23-51.6-28.3-73.62-40.03-58.55-39.1-121.15-20.76-185.96.6,11.75.72,23.57,1.83,35.28,2.58,26.95,23.84,42.83,38.64,62.18,20.71,27.11,30.81,56.66,27.98,90.56-.97,11.46-2.59,22.76-5.23,34.08-2.03,8.71-7.01,20.18-6.2,27.08,14.33-20.48,34.56-48.5,48.75-76.89,5.31-10.61,9.76-19.63,14.2-30.16,14.19-33.71,8.13-64.52-3.13-94.69-14.01-37.56-34.15-72.34-52.94-107.64-19.93-37.46-34.81-76.3-43.05-118.37-8.95-45.83-9.7-91.21-2.45-136.84,9.71-61.11,31.4-117.72,67.36-168.43,3.09-4.37,7.24-7.96,10.91-11.91-4.49,17.66-9.02,34.7-12.63,52.14-7.84,37.84-4.35,75.05,2.85,112.21,6.83,35.25,20.81,68.4,31.24,102.61,11.92,39.01,27.62,76.83,36.9,116.68,19.23,82.59,13.58,163.88-17.43,242.54Z"
        />
      </g>
    </svg>
  )
}
