"use client"

import { cn, Text } from "@dotkomonline/ui"
import { useEffect, useRef, useState } from "react"
import styles from "./RollingNumber.module.css"

interface RollingNumberProps {
  value: number
  className?: string
  containerClassName?: string
  minDigits?: number
}

interface DigitSlot {
  key: string
  previous: string
  current: string
  isRolling: boolean
  rollKey: number
}

const ROLLING_NUMBER_ANIMATION_MS = 260

const formatDisplayedValue = (value: number, minDigits?: number) => {
  if (minDigits === undefined) {
    return value.toString()
  }

  return value.toString().padStart(minDigits, "0")
}

const getDisplayedLength = (value: number, minDigits?: number) => formatDisplayedValue(value, minDigits).length

const initSlots = (display: string): DigitSlot[] =>
  Array.from(display, (ch, i) => ({
    key: `pos-${display.length - 1 - i}`,
    previous: ch,
    current: ch,
    isRolling: false,
    rollKey: 0,
  }))

const buildSlots = (previous: string, current: string, existing: DigitSlot[]): DigitSlot[] => {
  const length = Math.max(previous.length, current.length)
  const paddedPrevious = previous.padStart(length, " ")
  const paddedCurrent = current.padStart(length, " ")

  return Array.from({ length: length }, (_, i) => {
    const key = `pos-${length - 1 - i}`

    const prev = paddedPrevious[i]
    const curr = paddedCurrent[i]

    const changed = prev !== curr
    const existingSlog = existing.find((s) => s.key === key)
    const rollKey = changed ? (existingSlog?.rollKey ?? 0) + 1 : (existingSlog?.rollKey ?? 0)

    return {
      key,
      previous: prev,
      current: curr,
      isRolling: changed,
      rollKey,
    }
  })
}

/**
 * A component that displays a number that animates from the previous value to the current value.
 *
 * @example
 * <Text>
 *   <RollingNumber value={reservedAttendeeCount} /> påmeldte
 * </Text>
 */
export const RollingNumber = ({ value, containerClassName, className, minDigits }: RollingNumberProps) => {
  const currentDisplayRef = useRef(formatDisplayedValue(value, minDigits))
  const [slots, setSlots] = useState<DigitSlot[]>(() => initSlots(formatDisplayedValue(value, minDigits)))
  const [widthDigitCount, setWidthDigitCount] = useState(getDisplayedLength(value, minDigits))
  const [rollGeneration, setRollGeneration] = useState(0)

  useEffect(() => {
    const previousDisplay = currentDisplayRef.current
    const currentDisplay = formatDisplayedValue(value, minDigits)

    if (previousDisplay === currentDisplay) {
      return
    }

    currentDisplayRef.current = currentDisplay

    setWidthDigitCount(Math.max(previousDisplay.length, currentDisplay.length))
    setSlots((existing) => buildSlots(previousDisplay, currentDisplay, existing))
    setRollGeneration((g) => g + 1)
  }, [value, minDigits])

  useEffect(() => {
    if (rollGeneration === 0) {
      return
    }

    const timeout = setTimeout(() => {
      const finalDisplay = currentDisplayRef.current
      setWidthDigitCount(finalDisplay.length)
      setSlots(initSlots(finalDisplay))
    }, ROLLING_NUMBER_ANIMATION_MS)

    return () => {
      clearTimeout(timeout)
    }
  }, [rollGeneration])

  return (
    <span
      aria-live="polite"
      style={{ width: `${widthDigitCount}ch` }}
      className={cn(
        "inline-flex overflow-hidden align-baseline",
        "motion-safe:transition-[width] motion-safe:duration-120 motion-safe:ease-in-out",
        containerClassName
      )}
    >
      {slots.map((slot) => (
        <span key={slot.key} className={cn("inline-grid overflow-hidden", slot.isRolling && styles.isRolling)}>
          {slot.isRolling && (
            <Text
              element="span"
              key={`prev-${slot.rollKey}`}
              aria-hidden
              className={cn("[grid-area:1/1] font-mono", styles.previous, className)}
            >
              {slot.previous}
            </Text>
          )}
          <Text
            element="span"
            key={`curr-${slot.rollKey}`}
            className={cn("[grid-area:1/1] font-mono", slot.isRolling && styles.current, className)}
          >
            {slot.current}
          </Text>
        </span>
      ))}
    </span>
  )
}
