import { cn, Text, Tooltip, TooltipContent, TooltipTrigger } from "@dotkomonline/ui"
import { useId } from "react"
import Image from "next/image"
import { MembershipTypeSchema } from "@dotkomonline/rpc/user"
import { Plate, type PlateProps } from "./Plate"

export const RIDDERKORS_IMAGE_PATH = "/ridderkors.png"

export function KnightPlate(props: PlateProps) {
  return (
    <Plate
      {...props}
      className={cn(
        "group overflow-hidden rounded-full",
        "bg-[linear-gradient(to_right,#0d1f4f_0%,#0060a3_68%,#0d1f4f_100%)]"
      )}
    >
      <KnightPlateEffects />
      <Plate.IdentityArea className="p-1.75">
        <Plate.Avatar fallbackClassName="bg-white/25 text-white" />
        <Plate.AttendeeDetails nameClassName="font-medium text-white" subtitleClassName="text-white" />
      </Plate.IdentityArea>
      <Plate.AccessoryArea className="self-stretch overflow-hidden py-1.75 pr-1.75">
        <div className="absolute inset-0 mask-[linear-gradient(to_right,transparent_0,transparent_--spacing(2),black_--spacing(15))]">
          <KnightBackground
            className="h-full w-full"
            foregroundClassName="transition-[fill-color,fill-opacity] duration-300 group-hover:[fill-opacity:0.18]"
          />
        </div>
        <Plate.BigIcon />
      </Plate.AccessoryArea>
    </Plate>
  )
}

function KnightLargeIconImage() {
  return (
    <Image
      src={RIDDERKORS_IMAGE_PATH}
      alt="Ridder av det Indre Lager"
      width={40}
      height={40}
      className="block size-full rounded-full object-contain"
    />
  )
}

function KnightSmallIconImage() {
  return (
    <Image
      src={RIDDERKORS_IMAGE_PATH}
      alt="Ridder av det Indre Lager"
      width={20}
      height={20}
      className="size-full rounded-full object-contain"
    />
  )
}

export function getKnightLargeIcon() {
  return (
    <Tooltip key={MembershipTypeSchema.enum.KNIGHT} delayDuration={0}>
      <TooltipTrigger className="relative flex size-10 items-center justify-center overflow-hidden rounded-full bg-white p-px leading-none">
        <KnightLargeIconImage />
      </TooltipTrigger>
      <TooltipContent>
        <Text>Ridder av det Indre Lager</Text>
      </TooltipContent>
    </Tooltip>
  )
}

export function getKnightSmallIcon() {
  return (
    <Tooltip key={MembershipTypeSchema.enum.KNIGHT} delayDuration={0}>
      <TooltipTrigger className="relative -my-1 size-5 overflow-hidden rounded-full bg-white p-px">
        <KnightSmallIconImage />
      </TooltipTrigger>
      <TooltipContent>
        <Text>Ridder av det Indre Lager</Text>
      </TooltipContent>
    </Tooltip>
  )
}

interface KnightBackgroundProps {
  foregroundClassName?: string
  className?: string
}

function KnightBackground({ foregroundClassName, className }: KnightBackgroundProps) {
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
          .knight-plate-sparkle {
            animation: knight-plate-sparkle var(--sparkle-duration) ease-in-out infinite;
            animation-delay: var(--sparkle-delay);
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
      <div className="pointer-events-none absolute inset-0 z-20" aria-hidden>
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
