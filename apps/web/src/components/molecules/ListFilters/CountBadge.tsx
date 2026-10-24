import { Text, cn } from "@dotkomonline/ui"

interface CountBadgeProps {
  count: number
  className?: string
}

export const CountBadge = ({ count, className }: CountBadgeProps) => {
  if (count <= 0) {
    return null
  }

  return (
    <Text
      element="span"
      className={cn(
        "size-5.5 flex shrink-0 items-center justify-center rounded-full text-xs",
        "bg-blue-100 text-blue-900 dark:bg-sky-900 dark:text-sky-100",
        className
      )}
    >
      {count}
    </Text>
  )
}
