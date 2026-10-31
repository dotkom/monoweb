import { CountBadge } from "@/components/molecules/ListFilters/CountBadge"
import { Button, PopoverTrigger, cn } from "@dotkomonline/ui"
import { IconFilter2 } from "@tabler/icons-react"

interface EventFilterButtonProps {
  count: number
  isOpen: boolean
}

export function EventFilterButton({ count, isOpen }: EventFilterButtonProps) {
  return (
    <PopoverTrigger
      render={
        <Button
          variant="outline"
          className={cn(
            "max-md:hidden relative shrink-0 rounded-lg h-10 gap-2 max-lg:w-10 max-lg:px-0",
            isOpen && "bg-accent"
          )}
        />
      }
    >
      <IconFilter2 className="size-5" />
      <span className="max-lg:sr-only">Filter</span>
      <span
        aria-hidden={count === 0}
        className={cn(
          "relative -ml-2 h-5 shrink-0 overflow-hidden transition-[width] duration-100 ease-out motion-reduce:transition-none",
          "max-lg:absolute max-lg:-right-2 max-lg:-top-2 max-lg:ml-0 max-lg:w-5 max-lg:overflow-visible",
          count > 0 ? "w-7" : "w-0"
        )}
      >
        <CountBadge
          // Keep the badge mounted so removing the last filter can animate out too.
          count={Math.max(1, count)}
          className={cn(
            "absolute top-0 right-0 size-5 transition-[opacity,scale] duration-100 ease-out motion-reduce:transition-none",
            count > 0 ? "scale-100 opacity-100" : "scale-50 opacity-0"
          )}
        />
      </span>
    </PopoverTrigger>
  )
}
