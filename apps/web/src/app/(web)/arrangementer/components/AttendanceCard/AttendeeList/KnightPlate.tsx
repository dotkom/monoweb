import { cn, Text, Tooltip, TooltipContent, TooltipTrigger } from "@dotkomonline/ui"
import { useId } from "react"
import Image from "next/image"
import { MembershipTypeSchema } from "@dotkomonline/rpc/user"
import { Plate, type PlateProps } from "./Plate"
import styles from "./PlateBackground.module.css"
import { KnightPlateEffects } from "./KnightPlateEffects"

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
          className="outline-2 outline-user-plate-knight-fill/50 drop-shadow-md"
          fallbackClassName="bg-gray-300 text-gray-700 dark:bg-white/25 dark:text-white"
        />
        <Plate.AttendeeDetails
          className="flex-1"
          nameClassName={styles.textContrast}
          subtitleClassName={cn("text-gray-700 dark:text-stone-300", styles.textContrast)}
        />
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
