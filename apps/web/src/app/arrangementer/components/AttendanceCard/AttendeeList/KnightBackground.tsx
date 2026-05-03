import { useId } from "react"

interface KnightBackgroundProps {
  foregroundClassName?: string
  backgroundClassName?: string
  foregroundFillOpacity?: number
  className?: string
}

export const KnightBackground = ({
  foregroundClassName,
  backgroundClassName,
  foregroundFillOpacity = 0.4,
  className,
}: KnightBackgroundProps) => {
  const patternId = useId().replace(/:/g, "")

  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden="true">
      <defs>
        <pattern id={patternId} width="30" height="30" patternUnits="userSpaceOnUse">
          <path
            d="M15 0C6.716 0 0 6.716 0 15c8.284 0 15-6.716 15-15zM0 15c0 8.284 6.716 15 15 15 0-8.284-6.716-15-15-15zm30 0c0-8.284-6.716-15-15-15 0 8.284 6.716 15 15 15zm0 0c0 8.284-6.716 15-15 15 0-8.284 6.716-15 15-15z"
            className={foregroundClassName}
            fillOpacity={foregroundFillOpacity}
            fillRule="evenodd"
          />
        </pattern>
      </defs>

      <rect width="100%" height="100%" className={backgroundClassName} />
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  )
}
