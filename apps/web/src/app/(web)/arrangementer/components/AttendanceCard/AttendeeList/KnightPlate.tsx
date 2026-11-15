import { cn, Text, Tooltip, TooltipContent, TooltipTrigger } from "@dotkomonline/ui"
import { useId } from "react"
import Image from "next/image"
import { MembershipTypeSchema } from "@dotkomonline/rpc/user"
import { Plate, type PlateProps } from "./Plate"
import styles from "./PlateBackground.module.css"

export const RIDDERKORS_IMAGE_PATH = "/ridderkors.png"

export function KnightPlate(props: PlateProps) {
  return (
    <Plate {...props} className={cn("group overflow-hidden rounded-full", styles.background, styles.knight)}>
      <KnightPlateEffects />
      <KnightBackground
        className={styles.pattern}
        foregroundClassName="transition-[fill-opacity] duration-300 group-hover:[fill-opacity:0.18]"
      />
      <Plate.IdentityArea className="flex-1 p-1.75">
        <Plate.Avatar
          className="outline-2 outline-user-plate-knight-fill/50"
          fallbackClassName="bg-gray-300 text-gray-700 dark:bg-white/25 dark:text-white"
        />
        <Plate.AttendeeDetails className="flex-1" subtitleClassName="text-gray-700 dark:text-stone-300" />
      </Plate.IdentityArea>
      <Plate.AccessoryArea className="flex-none self-stretch overflow-hidden py-1.75 pr-1.75">
        <Plate.BigIcon />
      </Plate.AccessoryArea>
    </Plate>
  )
}

function KnightLargeIconImage() {
  return (
    <Image
      src={RIDDERKORS_IMAGE_PATH}
      alt="Ridder av Det Indre Lager"
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
      alt="Ridder av Det Indre Lager"
      width={20}
      height={20}
      className="block size-full rounded-full object-contain"
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
        <Text>Ridder av Det Indre Lager</Text>
      </TooltipContent>
    </Tooltip>
  )
}

export function getKnightSmallIcon() {
  return (
    <Tooltip key={MembershipTypeSchema.enum.KNIGHT} delayDuration={0}>
      <TooltipTrigger className="relative inline-flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-px leading-none">
        <KnightSmallIconImage />
      </TooltipTrigger>
      <TooltipContent>
        <Text>Ridder av Det Indre Lager</Text>
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

  const patternSize = 27
  const patternOffset = -patternSize / 2
  const patternTransform = `translate(0 ${patternOffset}) rotate(11.25)`
  const animationEnd = `${patternSize} 0`

  const renderPatternPaths = () => (
    <g className={cn("fill-white [fill-opacity:0.08]", foregroundClassName)}>
      <path d="M40 20L34 14L34 6L26 6L20 0L14 6L6 6L6 14L0 20L6 26L6 34L14 34L20 40L26 34L34 34L34 26z" />
      <path d="M14 14L6 14v-8h8zM26 14L26 6h8v8zM14 26L6 26v8h8zM26 26L34 26v8h-8z" />
    </g>
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
        <pattern
          id={staticPatternId}
          width={patternSize}
          height={patternSize}
          viewBox="0 0 40 40"
          patternUnits="userSpaceOnUse"
          patternTransform={patternTransform}
        >
          {renderPatternPaths()}
        </pattern>
        <pattern
          id={animatedPatternId}
          width={patternSize}
          height={patternSize}
          viewBox="0 0 40 40"
          patternUnits="userSpaceOnUse"
          patternTransform={patternTransform}
        >
          <animateTransform
            attributeName="patternTransform"
            type="translate"
            additive="sum"
            from="0 0"
            to={animationEnd}
            dur="4s"
            repeatCount="indefinite"
            calcMode="linear"
          />
          {renderPatternPaths()}
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
