"use client"

import { type AnimationEvent, type CSSProperties, useEffect, useRef } from "react"
import styles from "./KnightPlateEffects.module.css"

const SPARKLE_SIZES_PIXELS = [12, 14, 16] as const
const SPARKLE_DURATIONS_SECONDS = [6.5, 7.6, 8.7, 9.8, 10.9] as const
const MAX_SPARKLE_DRIFT_PIXELS = 3 as const
const MAX_SPARKLE_ROTATION_DEGREES = 180 as const

const sparklePositions: CSSProperties[] = [
  { left: "55%", top: "12%" },
  { left: "64%", top: "64%" },
  { left: "72%", top: "18%" },
  { left: "79%", top: "58%" },
  { left: "87%", top: "25%" },
  { left: "60%", top: "43%" },
  { left: "82%", top: "68%" },
  { left: "90%", top: "48%" },
  { right: 3, top: 12 },
  { right: 34, top: 3 },
  { right: 37, top: 34 },
]

const sparkleStyles: CSSProperties[] = sparklePositions.map((position, index) => {
  const size = SPARKLE_SIZES_PIXELS[index % SPARKLE_SIZES_PIXELS.length]
  const duration = SPARKLE_DURATIONS_SECONDS[index % SPARKLE_DURATIONS_SECONDS.length]

  return {
    ...position,
    width: size,
    height: size,
    animationDuration: `${duration}s`,
  }
})

function varySparkleTransform(event: AnimationEvent<HTMLSpanElement>) {
  const sparkle = event.currentTarget
  const movementRange = MAX_SPARKLE_DRIFT_PIXELS * 2
  const horizontalOffset = Math.random() * movementRange - MAX_SPARKLE_DRIFT_PIXELS
  const verticalOffset = Math.random() * movementRange - MAX_SPARKLE_DRIFT_PIXELS
  const rotation = Math.random() * MAX_SPARKLE_ROTATION_DEGREES

  sparkle.style.translate = `${horizontalOffset}px ${verticalOffset}px`
  sparkle.style.rotate = `${rotation}deg`
}

export function KnightPlateEffects() {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sparkles = container.current?.querySelectorAll<HTMLSpanElement>("span")

    for (const sparkle of sparkles ?? []) {
      const duration = Number.parseFloat(sparkle.style.animationDuration)
      sparkle.style.animationDelay = `${-Math.random() * duration}s`
    }
  }, [])

  return (
    <div ref={container} className="pointer-events-none absolute inset-0 z-20" aria-hidden="true">
      {sparkleStyles.map((sparkleStyle) => (
        <span
          key={JSON.stringify(sparkleStyle)}
          className={styles.sparkle}
          style={sparkleStyle}
          onAnimationIteration={varySparkleTransform}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M3 11a5 5 0 0 0 5 -5c0 -1.333 2 -1.333 2 0a5 5 0 0 0 5 5c1.333 0 1.333 2 0 2a5 5 0 0 0 -5 5a1 1 0 0 1 -2 0a5 5 0 0 0 -5 -5c-1.333 0 -1.333 -2 0 -2" />
          </svg>
        </span>
      ))}
    </div>
  )
}
