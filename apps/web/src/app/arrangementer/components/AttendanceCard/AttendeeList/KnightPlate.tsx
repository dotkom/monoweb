import { MembershipTypeSchema, type Attendee } from "@dotkomonline/types"
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
  TooltipContent,
  TooltipTrigger,
} from "@dotkomonline/ui"
import { IconUser, IconX } from "@tabler/icons-react"
import Link from "next/link.js"
import { useId, type PropsWithChildren } from "react"
import { GenericPlateUserSection } from "./GenericPlate"
import type { PlateProps } from "./AttendeePlate"
import Image from "next/image"

export const RIDDERKORS_IMAGE_PATH = "/ridderkors.png"

export const KnightPlate = ({ attendee, rightSection, largeIcon, smallIcons }: PlateProps) => {
  const resolvedRightSection = rightSection ?? largeIcon

  return (
    <div
      className={cn(
        "group relative flex w-full items-stretch overflow-hidden rounded-lg p-px",
        "transition-all duration-300",
        "bg-[linear-gradient(135deg,#1d2633_0%,#56606d_18%,#c4ccd6_42%,#3d4654_58%,#87919e_76%,#172131_100%)]",
        "shadow-[0_0_0_1px_rgba(20,28,40,0.7),0_0_10px_rgba(0,96,163,0.55),0_0_22px_rgba(160,160,200,0.2)]",
        "hover:shadow-[0_0_0_1px_rgba(200,210,224,0.45),0_0_16px_rgba(0,96,163,0.4),0_0_32px_rgba(180,180,220,0.38)]"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-lg",
          "bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.9)_0_1px,transparent_2px),radial-gradient(circle_at_42%_0%,rgba(220,230,245,0.7)_0_1px,transparent_2px),radial-gradient(circle_at_84%_70%,rgba(255,255,255,0.65)_0_1px,transparent_2px)]",
          "opacity-70 transition-opacity duration-300 group-hover:opacity-100"
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-lg",
          "bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.65)_18%,transparent_32%,transparent_66%,rgba(170,190,220,0.5)_78%,transparent_100%)]",
          "opacity-35 transition-opacity duration-300 group-hover:opacity-55"
        )}
      />
      <KnightPlateEffects />
      <div
        className={cn(
          "relative z-10 flex w-full min-w-0 flex-1 items-center overflow-hidden rounded-[7px]",
          "bg-[linear-gradient(to_right,#0d1f4f_0%,#0060a3_68%,#0d1f4f_100%)]"
        )}
      >
        <KnightPlateProfileLink attendee={attendee}>
          <GenericPlateUserSection
            attendee={attendee}
            nameClassName="font-medium text-accent"
            gradeClassName="text-white"
          >
            {smallIcons}
          </GenericPlateUserSection>
        </KnightPlateProfileLink>

        <KnightPlatePatternArea>
          <div className="min-w-4 flex-1" />

          {resolvedRightSection && (
            <div className="relative z-10 flex shrink-0 items-center justify-center pr-2">{resolvedRightSection}</div>
          )}
        </KnightPlatePatternArea>
      </div>
    </div>
  )
}

function getIconContent() {
  return (
    <>
      <div className="mt-2 flex w-full items-center justify-center">
        <Image
          src={RIDDERKORS_IMAGE_PATH}
          alt="Ridder av det Indre Lager"
          width={160}
          height={160}
          className="rounded-sm"
        />
      </div>
      <Text className="text-xs text-gray-500 dark:text-stone-500">For riddere av Det Indre Lager.</Text>
    </>
  )
}

function KnightLargeIconImage() {
  return (
    <div className="size-9 shrink-0 overflow-hidden rounded-full bg-white p-0.5 shadow-[0_0_0_2px_rgba(148,163,184,0.85),0_0_14px_rgba(180,180,220,0.45)]">
      <Image
        src={RIDDERKORS_IMAGE_PATH}
        alt="Ridder av det Indre Lager"
        width={36}
        height={36}
        className="size-full rounded-full object-contain"
      />
    </div>
  )
}

function KnightSmallIconImage() {
  return (
    <div className="size-5 shrink-0 overflow-hidden rounded-full bg-white p-px ring-1 ring-slate-400 ring-offset-1 shadow-[0_0_10px_rgba(180,180,220,.25)]">
      <Image
        src={RIDDERKORS_IMAGE_PATH}
        alt="Ridder av det Indre Lager"
        width={20}
        height={20}
        className="size-full rounded-full object-contain"
      />
    </div>
  )
}

export function getKnightLargeIcon() {
  return (
    <Popover key={MembershipTypeSchema.enum.KNIGHT}>
      <Tilt scale={1.05} tiltMaxAngleX={8} tiltMaxAngleY={8} glareMaxOpacity={0.2} className="rounded-sm">
        <PopoverTrigger className="relative h-fit rounded-full bg-slate-50 p-1 shadow-[0_0_12px_rgba(180,180,220,.45)]">
          <KnightLargeIconImage />
        </PopoverTrigger>
      </Tilt>
      <PopoverContent side="left" className="flex w-64 flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <Title element="p">Ridder av det Indre Lager</Title>
          <PopoverClose className="rounded p-0.5 transition-colors hover:bg-gray-100 dark:hover:bg-stone-600">
            <IconX className="size-4 text-gray-500 dark:text-stone-400" />
          </PopoverClose>
        </div>
        {getIconContent()}
      </PopoverContent>
    </Popover>
  )
}

export function getKnightSmallIcon() {
  return (
    <Tooltip key={MembershipTypeSchema.enum.KNIGHT} delayDuration={100}>
      <TooltipTrigger className="relative -my-1 h-fit rounded-full bg-slate-50 p-0.5 shadow-[0_0_12px_rgba(180,180,220,.45)]">
        <KnightSmallIconImage />
      </TooltipTrigger>
      <TooltipContent>
        <div className="flex max-w-xs flex-col gap-2">
          <Title element="p">Ridder av det Indre Lager</Title>
          {getIconContent()}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

function KnightPlateProfileLink({ attendee, children }: PropsWithChildren<{ attendee: Attendee }>) {
  return (
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
}

function KnightPlatePatternArea({ children }: PropsWithChildren) {
  return (
    <div className="relative flex min-w-4 flex-1 self-stretch overflow-hidden">
      <div className="pointer-events-none absolute inset-0 mask-[linear-gradient(to_right,transparent_0,transparent_calc(var(--spacing)*2),black_calc(var(--spacing)*15))]">
        <KnightBackground
          className="h-full w-full"
          foregroundClassName="transition-[fill-color,fill-opacity] duration-300 group-hover:[fill-opacity:0.28]"
          backgroundClassName="fill-none"
        />
      </div>
      {children}
    </div>
  )
}

interface KnightBackgroundProps {
  foregroundClassName?: string
  backgroundClassName?: string
  foregroundFillOpacity?: number
  className?: string
}

function KnightBackground({ foregroundClassName, backgroundClassName, className }: KnightBackgroundProps) {
  const patternId = useId().replace(/:/g, "")
  const staticPatternId = `${patternId}-static`
  const animatedPatternId = `${patternId}-animated`

  const renderPatternPath = () => (
    <path
      d="M15 0C6.716 0 0 6.716 0 15c8.284 0 15-6.716 15-15zM0 15c0 8.284 6.716 15 15 15 0-8.284-6.716-15-15-15zm30 0c0-8.284-6.716-15-15-15 0 8.284 6.716 15 15 15zm0 0c0 8.284-6.716 15-15 15 0-8.284 6.716-15 15-15z"
      className={cn("fill-white [fill-opacity:0.08]", foregroundClassName)}
      fillRule="evenodd"
    />
  )

  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden="true">
      <defs>
        <style>
          {`
            .knight-background-animated {
              display: none;
            }

            @media (prefers-reduced-motion: no-preference) {
              .knight-background-static {
                display: none;
              }

              .knight-background-animated {
                display: block;
              }
            }
          `}
        </style>
        <pattern id={staticPatternId} width="30" height="30" patternUnits="userSpaceOnUse">
          {renderPatternPath()}
        </pattern>
        <pattern id={animatedPatternId} width="30" height="30" patternUnits="userSpaceOnUse">
          <animateTransform
            attributeName="patternTransform"
            type="translate"
            from="0 0"
            to="30 0"
            dur="4s"
            repeatCount="indefinite"
            calcMode="linear"
          />
          {renderPatternPath()}
        </pattern>
      </defs>

      <rect width="100%" height="100%" className={backgroundClassName} />
      <rect width="100%" height="100%" fill={`url(#${staticPatternId})`} className="knight-background-static" />
      <rect width="100%" height="100%" fill={`url(#${animatedPatternId})`} className="knight-background-animated" />
    </svg>
  )
}

function Sparkle() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 11a5 5 0 0 0 5 -5c0 -1.333 2 -1.333 2 0a5 5 0 0 0 5 5c1.333 0 1.333 2 0 2a5 5 0 0 0 -5 5a1 1 0 0 1 -2 0a5 5 0 0 0 -5 -5c-1.333 0 -1.333 -2 0 -2" />
    </svg>
  )
}

function KnightPlateEffects() {
  return (
    <>
      <style>
        {`
        .knight-plate-sheen {
          transform: translateX(-140%) skewX(-18deg);
        }

        .knight-plate-sparkle {
          opacity: 0;
          transform: rotate(0deg) scale(0.45);
          color: rgb(226 232 240);
          filter: drop-shadow(0 0 4px rgba(215, 230, 255, 0.75));
        }

        .knight-plate-sparkle-one {
          --sparkle-delay: 0.4s;
          --sparkle-duration: 7.5s;
          --sparkle-rotation-start: 18deg;
          --sparkle-rotation-end: 210deg;
        }

        .knight-plate-sparkle-two {
          --sparkle-delay: 2.1s;
          --sparkle-duration: 8.8s;
          --sparkle-rotation-start: 72deg;
          --sparkle-rotation-end: 260deg;
        }

        .knight-plate-sparkle-three {
          --sparkle-delay: 4.7s;
          --sparkle-duration: 9.6s;
          --sparkle-rotation-start: -24deg;
          --sparkle-rotation-end: 180deg;
        }

        .knight-plate-sparkle-four {
          --sparkle-delay: 1.2s;
          --sparkle-duration: 10.4s;
          --sparkle-rotation-start: 34deg;
          --sparkle-rotation-end: 240deg;
        }

        .knight-plate-sparkle-five {
          --sparkle-delay: 0.8s;
          --sparkle-duration: 7.9s;
          --sparkle-rotation-start: 58deg;
          --sparkle-rotation-end: 250deg;
        }

        .knight-plate-sparkle-six {
          --sparkle-delay: 2.8s;
          --sparkle-duration: 5.7s;
          --sparkle-rotation-start: 38deg;
          --sparkle-rotation-end: 220deg;
        }

        .knight-plate-sparkle-seven {
          --sparkle-delay: 5.6s;
          --sparkle-duration: 6.8s;
          --sparkle-rotation-start: -12deg;
          --sparkle-rotation-end: 200deg;
        }

        .knight-plate-sparkle-eight {
          --sparkle-delay: 7.5s;
          --sparkle-duration: 8.2s;
          --sparkle-rotation-start: 10deg;
          --sparkle-rotation-end: 230deg;
        }

        @media (prefers-reduced-motion: no-preference) {
          .knight-plate-sheen {
            animation: knight-plate-sheen 9s linear infinite;
          }

          .knight-plate-sparkle {
            animation: knight-plate-sparkle var(--sparkle-duration) ease-in-out infinite;
            animation-delay: var(--sparkle-delay);
          }
        }

        @keyframes knight-plate-sheen {
          0% {
            opacity: 0;
            transform: translateX(-140%) skewX(-18deg);
          }
          8%,
          34% {
            opacity: 0.7;
          }
          45% {
            opacity: 0;
            transform: translateX(140%) skewX(-18deg);
          }
          100% {
            opacity: 0;
            transform: translateX(140%) skewX(-18deg);
          }
        }

        @keyframes knight-plate-sparkle {
          0%,
          70%,
          100% {
            opacity: 0;
            transform: rotate(var(--sparkle-rotation-start)) scale(0.45);
          }
          12% {
            opacity: 0.85;
          }
          24% {
            opacity: 0.55;
            transform: rotate(var(--sparkle-rotation-end)) scale(1.15);
          }
          38% {
            opacity: 0;
            transform: rotate(var(--sparkle-rotation-end)) scale(0.7);
          }
        }
      `}
      </style>
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-lg" aria-hidden>
        <div className="knight-plate-sheen absolute inset-y-0 left-0 w-1/2 opacity-70 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.12)_35%,rgba(235,242,255,0.40)_50%,rgba(255,255,255,0.12)_65%,transparent_100%)]" />

        <span className="absolute knight-plate-sparkle knight-plate-sparkle-one left-[66%] top-[18%] size-3.5">
          <Sparkle />
        </span>
        <span className="absolute knight-plate-sparkle knight-plate-sparkle-two left-[56%] top-[65%] size-3.5">
          <Sparkle />
        </span>
        <span className="absolute knight-plate-sparkle knight-plate-sparkle-three left-[69%] top-[60%] size-3">
          <Sparkle />
        </span>
        <span className="absolute knight-plate-sparkle knight-plate-sparkle-four left-[88%] top-[29%] size-3">
          <Sparkle />
        </span>
        <span className="absolute knight-plate-sparkle knight-plate-sparkle-five left-[61%] top-[24%] size-4">
          <Sparkle />
        </span>
        <span className="absolute knight-plate-sparkle knight-plate-sparkle-six left-[74%] top-[35%] size-4">
          <Sparkle />
        </span>
        <span className="absolute knight-plate-sparkle knight-plate-sparkle-seven left-[83%] top-[28%] size-2.5">
          <Sparkle />
        </span>
        <span className="absolute knight-plate-sparkle knight-plate-sparkle-eight left-[78%] top-[58%] size-2.5">
          <Sparkle />
        </span>
      </div>
    </>
  )
}
