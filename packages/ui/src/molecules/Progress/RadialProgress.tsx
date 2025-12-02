import { useMemo } from "react"
import { Text } from "../../atoms/Typography/Text"
import { cn } from "../../utils"

interface RadialProgressProps {
  percentage?: number
  size?: number
  strokeWidth?: number
  reverse?: boolean
  hideText?: boolean
  backgroundCircleClassname?: string
  progressCircleClassname?: string
  textClassname?: string
}

export function RadialProgress({
  percentage: rawPercentage = 60,
  size = 48,
  strokeWidth = 6,
  reverse = false,
  hideText = false,
  backgroundCircleClassname,
  progressCircleClassname,
  textClassname,
}: RadialProgressProps) {
  const { percentage, radius, circumference, offset } = useMemo(() => {
    const percentage = Math.min(Math.max(rawPercentage, 0), 100)
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius

    const forwardOffset = circumference * (1 - percentage / 100)
    const reverseOffset = -circumference * (1 - percentage / 100)
    const offset = reverse ? reverseOffset : forwardOffset

    return { percentage, radius, circumference, offset }
  }, [size, strokeWidth, rawPercentage, reverse])

  const circle = (
    <svg role="img" aria-hidden="true" width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        className={cn("text-gray-300 dark:text-stone-600", backgroundCircleClassname)}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      {/* Progress circle */}
      <circle
        className={cn("text-black dark:text-white", progressCircleClassname)}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
    </svg>
  )

  return (
    <div
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(hideText ? "inline-flex" : "relative inline-flex")}
    >
      {circle}
      {!hideText && (
        <Text
          element="span"
          style={{ fontSize: size / 3.75, width: size, height: size }}
          className={cn("absolute inset-0 flex items-center justify-center font-semibold", textClassname)}
        >
          {Math.round(percentage)}%
        </Text>
      )}
    </div>
  )
}
