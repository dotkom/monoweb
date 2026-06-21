import type { ComponentPropsWithoutRef, FC } from "react"
import { cn } from "../../utils"

/**
 * The timeline is a three column grid; side labels, "rail" (line and dots), and content.
 *
 * Each row (item or group header) is a subgrid, so the side label column is auto-sized and stays aligned across all
 * rows. When no row renders a side label, the first column collapses to zero width, meaning it can be omitted.
 */
const timelineGridClassName = "grid grid-cols-[auto_1.5rem_minmax(0,1fr)]"
const timelineRowClassName = "group/timeline-row col-span-full grid grid-cols-subgrid"

const TimelineRailLine = () => (
  <span
    aria-hidden="true"
    className={cn(
      "absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 bg-brand",
      "group-first/timeline-row:rounded-t-sm",
      "group-first/timeline-row:mask-[linear-gradient(to_bottom,transparent,black_1.25rem)]",
      "group-last/timeline-row:bottom-auto group-last/timeline-row:h-8 group-last/timeline-row:rounded-b-sm",
      "group-last/timeline-row:mask-[linear-gradient(to_bottom,black_55%,transparent)]"
    )}
  />
)

export const Timeline: FC<ComponentPropsWithoutRef<"div">> = ({ className, ...props }) => (
  <div data-slot="timeline" className={cn("w-full", timelineGridClassName, className)} {...props} />
)

export const TimelineItem: FC<ComponentPropsWithoutRef<"div">> = ({ className, ...props }) => (
  <div data-slot="timeline-item" className={cn(timelineRowClassName, className)} {...props} />
)

/**
 * Optional label to the left of the rail (typically a time or date).
 *
 * You can hide it with `max-sm:hidden` and render a label inside the content instead for small screens.
 *
 * NOTE: a hidden side label (`max-sm:hidden`) still shifts the indicator down, so you should give the in-content label
 * a base line-height (`leading-6`) to keep it aligned with the dot.
 */
export const TimelineSideLabel: FC<ComponentPropsWithoutRef<"div">> = ({ className, ...props }) => (
  <div
    data-slot="timeline-side-label"
    className={cn(
      "col-start-1 row-start-1 min-w-0 pt-1 pr-2 text-right",
      "whitespace-nowrap font-medium text-muted-foreground text-xs",
      className
    )}
    {...props}
  />
)

/**
 * The dot on the rail. Renders the rail line segment for its row as well.
 *
 * NOTE: The dot aligns with the first text line of the content (`top-0.5` matches a `text-xs` first line). When the row
 * has a `TimelineSideLabel`, it shifts down to `top-1.5` to align with the side label and a base-size first line
 * instead. Override with `className` if your content needs a different offset.
 */
export const TimelineDot: FC<ComponentPropsWithoutRef<"div">> = ({ className, children, ...props }) => (
  <div data-slot="timeline-dot" className="relative col-start-2 row-start-1" {...props}>
    <TimelineRailLine />

    <span
      aria-hidden="true"
      className={cn(
        "absolute left-1/2 z-10 block size-3 -translate-x-1/2 rounded-full",
        "top-0.5 group-has-data-[slot=timeline-side-label]/timeline-row:top-1.5",
        "border-[3px] border-brand bg-white",
        className
      )}
    />

    {children}
  </div>
)

export const TimelineContent: FC<ComponentPropsWithoutRef<"div">> = ({ className, ...props }) => (
  <div
    data-slot="timeline-content"
    className={cn("col-start-3 row-start-1 min-w-0 pb-6 pl-2 group-last/timeline-row:pb-0", className)}
    {...props}
  />
)

export type TimelineGroupHeaderPosition = "side" | "content" | "responsive"

export type TimelineGroupHeaderProps = ComponentPropsWithoutRef<"div"> & {
  position?: TimelineGroupHeaderPosition
}

const groupHeaderSideLabelClassName = "col-start-1 pr-2 text-right"
const groupHeaderContentLabelClassName = "col-start-3 pl-2 text-left"

const groupHeaderLabelPositionClassNames: Record<TimelineGroupHeaderPosition, string> = {
  side: groupHeaderSideLabelClassName,
  content: groupHeaderContentLabelClassName,
  responsive: cn(groupHeaderContentLabelClassName, "sm:col-start-1 sm:pr-2 sm:pl-0 sm:text-right"),
}

/**
 * A row without an indicator (dot) that labels a group of entries (for example a date heading). The rail line continues
 * through it, and it provides the vertical gap between groups with its own padding so entry spacing stays uniform.
 *
 * `position` can be:
 * - `side` places the label to the left side of the rail. (default)
 * - `content` places the label above the content, on the right side of the rail.
 * - `responsive`:
 *   - below `sm:` -> `content`
 *   - above or equal to `sm:` -> `side`.
 */
export const TimelineGroupHeader: FC<TimelineGroupHeaderProps> = ({
  position = "side",
  className,
  children,
  ...props
}) => {
  const labelPositionClassName = groupHeaderLabelPositionClassNames[position]

  return (
    <div data-slot="timeline-group-header" className={cn(timelineRowClassName, className)} {...props}>
      <div
        className={cn(
          "row-start-1 min-w-0 pt-4 pb-1 group-first/timeline-row:pt-0",
          "whitespace-nowrap font-semibold text-sm",
          labelPositionClassName
        )}
      >
        {children}
      </div>

      <div className="relative col-start-2 row-start-1">
        <TimelineRailLine />
      </div>
    </div>
  )
}
