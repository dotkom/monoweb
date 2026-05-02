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

const ROLLING_NUMBER_ANIMATION_MS = 260

const formatDisplayedValue = (value: number, minDigits?: number) => {
  const stringValue = String(value)

  if (minDigits === undefined) {
    return stringValue
  }

  return stringValue.padStart(minDigits, "0")
}

const getDisplayedLength = (value: number, minDigits?: number) => formatDisplayedValue(value, minDigits).length

/**
 * A component that displays a number that animates from the previous value to the current value.
 *
 * @example
 * <Text>
 *   <RollingNumber value={reservedAttendeeCount} /> påmeldte
 * </Text>
 */
export const RollingNumber = ({ value, containerClassName, className, minDigits }: RollingNumberProps) => {
  const currentValueRef = useRef(value)
  const [previousValue, setPreviousValue] = useState(value)
  const [currentValue, setCurrentValue] = useState(value)
  const [widthDigitCount, setWidthDigitCount] = useState(getDisplayedLength(value, minDigits))
  const [rollKey, setRollKey] = useState(0)
  const [isRolling, setIsRolling] = useState(false)

  useEffect(() => {
    const previous = currentValueRef.current

    if (value === previous) {
      return
    }

    setPreviousValue(previous)
    currentValueRef.current = value
    setCurrentValue(value)
    setWidthDigitCount(Math.max(getDisplayedLength(previous, minDigits), getDisplayedLength(value, minDigits)))
    setRollKey((key) => key + 1)
    setIsRolling(true)
  }, [value, minDigits])

  useEffect(() => {
    if (rollKey === 0) {
      return
    }

    const timeout = setTimeout(() => {
      setIsRolling(false)
      setWidthDigitCount(getDisplayedLength(currentValueRef.current, minDigits))
    }, ROLLING_NUMBER_ANIMATION_MS)

    return () => clearTimeout(timeout)
  }, [rollKey, minDigits])

  const width = `${widthDigitCount}ch`

  return (
    <span
      aria-live="polite"
      style={{ width }}
      className={cn(
        "inline-grid overflow-hidden align-baseline",
        "motion-safe:transition-[width] motion-safe:duration-120 motion-safe:ease-in-out",
        isRolling && styles.isRolling,
        containerClassName
      )}
    >
      {isRolling && (
        <Text
          element="span"
          key={`previous-${rollKey}`}
          aria-hidden
          className={cn("[grid-area:1/1] font-mono", styles.previous, className)}
        >
          {formatDisplayedValue(previousValue, minDigits)}
        </Text>
      )}

      <Text
        element="span"
        key={`current-${rollKey}`}
        className={cn("[grid-area:1/1] font-mono", isRolling && styles.current, className)}
      >
        {formatDisplayedValue(currentValue, minDigits)}
      </Text>
    </span>
  )
}
