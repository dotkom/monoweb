"use client"

import { cn } from "@dotkomonline/ui"
import { useEffect, useRef, useState } from "react"
import styles from "./RollingNumber.module.css"

interface RollingNumberProps {
  value: number
}

const ROLLING_NUMBER_ANIMATION_MS = 260
const getDigitCount = (value: number) => value.toString().length

export const RollingNumber = ({ value }: RollingNumberProps) => {
  const currentValueRef = useRef(value)
  const [previousValue, setPreviousValue] = useState(value)
  const [currentValue, setCurrentValue] = useState(value)
  const [widthDigitCount, setWidthDigitCount] = useState(getDigitCount(value))
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
    setWidthDigitCount(Math.max(getDigitCount(previous), getDigitCount(value)))
    setRollKey((key) => key + 1)
    setIsRolling(true)
  }, [value])

  useEffect(() => {
    if (rollKey === 0) {
      return
    }

    const timeout = setTimeout(() => {
      setIsRolling(false)
      setWidthDigitCount(getDigitCount(currentValueRef.current))
    }, ROLLING_NUMBER_ANIMATION_MS)

    return () => clearTimeout(timeout)
  }, [rollKey])

  const width = `${widthDigitCount}ch`

  return (
    <span
      className={cn(
        "inline-grid overflow-hidden align-baseline tabular-nums leading-[inherit]",
        "motion-safe:transition-[width] motion-safe:duration-120 motion-safe:ease-in-out",
        isRolling && styles.isRolling
      )}
      style={{ width }}
      aria-live="polite"
    >
      {isRolling && (
        <span key={`previous-${rollKey}`} aria-hidden className={cn("[grid-area:1/1]", styles.previous)}>
          {previousValue}
        </span>
      )}
      <span key={`current-${rollKey}`} className={cn("[grid-area:1/1]", isRolling && styles.current)}>
        {currentValue}
      </span>
    </span>
  )
}
