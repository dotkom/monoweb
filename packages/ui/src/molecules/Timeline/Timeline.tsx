import {
  Children,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type FC,
  Fragment,
  isValidElement,
  type ReactNode,
} from "react"
import { cn } from "../../utils"

/**
 * The vertical timeline is a three column grid; side labels, "rail" (line and dots), and content.
 *
 * Each row (item or group header) is a subgrid, so the side label column is auto-sized and stays aligned across all
 * rows. When no row renders a side label, the first column collapses to zero width, meaning it can be omitted.
 * Horizontal timelines transpose this into three shared rows, with each item occupying a column.
 */
export type TimelineOrientation = "vertical" | "horizontal"
export type TimelineColor = "brand" | "gray"
export type TimelineBleed = "start" | "end" | "both"

export type TimelineProps = ComponentPropsWithoutRef<"div"> & {
  orientation?: TimelineOrientation
  color?: TimelineColor
  showRailStubs?: boolean
  /**
   * Removes the inset at the chosen ends. This is left/right horizontally and top/bottom vertically.
   */
  bleed?: TimelineBleed
}

const timelineGridClassNames: Record<TimelineOrientation, string> = {
  vertical: "grid-cols-[auto_1.5rem_minmax(0,1fr)]",
  horizontal:
    "grid-flow-col grid-cols-(--timeline-columns) auto-cols-[minmax(12rem,1fr)] grid-rows-[auto_1.5rem_minmax(0,1fr)] overflow-x-auto",
}

const timelineColorClassNames: Record<TimelineColor, string> = {
  brand: "[--timeline-color:var(--color-brand)]",
  gray: "[--timeline-color:theme(colors.gray.300)] dark:[--timeline-color:theme(colors.stone.600)]",
}

const timelineBleedClassNames: Record<TimelineOrientation, Record<TimelineBleed, string>> = {
  horizontal: {
    start: "-ml-4 w-[calc(100%+1rem)]",
    end: "-mr-4 w-[calc(100%+1rem)]",
    both: "-mx-4 w-[calc(100%+2rem)]",
  },
  vertical: {
    start: "-mt-0.5 has-[>[data-slot=timeline-item]:first-child_[data-slot=timeline-side-label]]:-mt-1.5",
    end: "-mb-0.5",
    both: "-my-0.5 has-[>[data-slot=timeline-item]:first-child_[data-slot=timeline-side-label]]:-mt-1.5",
  },
}

const timelineRowClassName = cn(
  "group/timeline-row col-span-full grid grid-cols-subgrid [--timeline-dot-position:1.375rem]",
  "group-data-[orientation=horizontal]/timeline:col-span-1 group-data-[orientation=horizontal]/timeline:row-span-full",
  "group-data-[orientation=horizontal]/timeline:grid-cols-none group-data-[orientation=horizontal]/timeline:grid-rows-subgrid"
)

const timelineRailClassName = cn(
  "relative col-start-2 row-start-1",
  "group-data-[orientation=horizontal]/timeline:col-start-1 group-data-[orientation=horizontal]/timeline:row-start-2"
)

const TimelineRailLine = () => (
  <span
    aria-hidden="true"
    className={cn(
      "absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 bg-(--timeline-color)",
      "group-data-[orientation=vertical]/timeline:group-first/timeline-row:rounded-t-sm",
      "group-data-[rail-stubs=true]/timeline:group-data-[orientation=vertical]/timeline:group-first/timeline-row:group-not-has-data-[slot=timeline-dot]/timeline-row:mask-[linear-gradient(to_bottom,transparent,black_1.25rem)]",
      // Start at the first dot's center, including its lower offset when a side label is present.
      "group-data-[orientation=vertical]/timeline:group-first/timeline-row:group-has-data-[slot=timeline-dot]/timeline-row:top-2",
      "group-data-[orientation=vertical]/timeline:group-first/timeline-row:group-has-data-[slot=timeline-dot]/timeline-row:group-has-data-[slot=timeline-side-label]/timeline-row:top-3",
      "group-data-[orientation=vertical]/timeline:group-last/timeline-row:bottom-auto",
      "group-data-[orientation=vertical]/timeline:group-last/timeline-row:h-8",
      "group-data-[orientation=vertical]/timeline:group-last/timeline-row:rounded-b-sm",
      "group-data-[rail-stubs=true]/timeline:group-data-[orientation=vertical]/timeline:group-last/timeline-row:mask-[linear-gradient(to_bottom,black_55%,transparent)]",
      // Overlap horizontal segments so fractional column widths do not leave seams.
      "group-data-[orientation=horizontal]/timeline:left-0 group-data-[orientation=horizontal]/timeline:-right-px",
      "group-data-[orientation=horizontal]/timeline:top-1/2",
      "group-data-[orientation=horizontal]/timeline:bottom-auto group-data-[orientation=horizontal]/timeline:w-auto",
      "group-data-[orientation=horizontal]/timeline:translate-x-0",
      "group-data-[orientation=horizontal]/timeline:h-1 group-data-[orientation=horizontal]/timeline:-translate-y-1/2",
      "group-data-[orientation=horizontal]/timeline:group-first/timeline-row:rounded-l-sm",
      "group-data-[orientation=horizontal]/timeline:group-first/timeline-row:left-[max(0px,calc(var(--timeline-dot-position)-1.375rem))]",
      "group-data-[rail-stubs=true]/timeline:group-data-[orientation=horizontal]/timeline:group-first/timeline-row:mask-[linear-gradient(to_right,transparent,black_1rem)]",
      "group-data-[orientation=horizontal]/timeline:group-last/timeline-row:right-[max(0px,calc(100%-var(--timeline-dot-position)-1.375rem))]",
      "group-data-[orientation=horizontal]/timeline:group-last/timeline-row:rounded-r-sm",
      "group-data-[rail-stubs=true]/timeline:group-data-[orientation=horizontal]/timeline:group-last/timeline-row:mask-[linear-gradient(to_right,black_calc(100%-1rem),transparent)]",
      "group-data-[rail-stubs=true]/timeline:group-data-[orientation=horizontal]/timeline:group-only/timeline-row:mask-[linear-gradient(to_right,transparent,black_1rem,black_calc(100%-1rem),transparent)]",
      // Without stubs, hide headers outside the dot range and stop each end at the dot's center.
      "group-data-[rail-stubs=false]/timeline:group-data-[slot=timeline-group-header]/timeline-row:group-[:not([data-slot=timeline-item]~*)]/timeline-row:hidden",
      "group-data-[rail-stubs=false]/timeline:group-data-[slot=timeline-group-header]/timeline-row:group-[:not(:has(~[data-slot=timeline-item]))]/timeline-row:hidden",
      "group-data-[rail-stubs=false]/timeline:group-data-[orientation=vertical]/timeline:group-[:nth-child(1_of_[data-slot=timeline-item])]/timeline-row:top-2",
      "group-data-[rail-stubs=false]/timeline:group-data-[orientation=vertical]/timeline:group-[:nth-child(1_of_[data-slot=timeline-item])]/timeline-row:group-has-data-[slot=timeline-side-label]/timeline-row:top-3",
      "group-data-[rail-stubs=false]/timeline:group-data-[orientation=vertical]/timeline:group-[:nth-last-child(1_of_[data-slot=timeline-item])]/timeline-row:h-2",
      "group-data-[rail-stubs=false]/timeline:group-data-[orientation=vertical]/timeline:group-[:nth-last-child(1_of_[data-slot=timeline-item])]/timeline-row:group-has-data-[slot=timeline-side-label]/timeline-row:h-3",
      "group-data-[rail-stubs=false]/timeline:group-data-[orientation=vertical]/timeline:group-[:nth-child(1_of_[data-slot=timeline-item]):nth-last-child(1_of_[data-slot=timeline-item])]/timeline-row:h-0",
      "group-data-[rail-stubs=false]/timeline:group-data-[orientation=horizontal]/timeline:group-[:nth-child(1_of_[data-slot=timeline-item])]/timeline-row:left-(--timeline-dot-position)",
      "group-data-[rail-stubs=false]/timeline:group-data-[orientation=horizontal]/timeline:group-[:nth-last-child(1_of_[data-slot=timeline-item])]/timeline-row:right-[calc(100%-var(--timeline-dot-position))]",
      "group-data-[rail-stubs=false]/timeline:group-data-[orientation=horizontal]/timeline:group-[:nth-last-child(1_of_[data-slot=timeline-item])]/timeline-row:w-auto"
    )}
  />
)

const getHorizontalTimelineColumns = (children: ReactNode): string[] =>
  Children.toArray(children).flatMap((child) => {
    if (isValidElement<{ children?: ReactNode }>(child)) {
      if (child.type === Fragment) {
        return getHorizontalTimelineColumns(child.props.children)
      }

      if (child.type === TimelineGroupHeader) {
        return ["max-content"]
      }
    }

    return ["minmax(12rem,1fr)"]
  })

/**
 * A vertical or horizontal timeline. It consists of a rail, dots, labels, and content.
 *
 * Set `color` to color both the rail and dots.
 *
 * Set `showRailStubs={false}` to stop the rail at the first and last dots without fading extensions.
 *
 * Use `bleed="start" | "end" | "both"` to remove the inset at the selected container edges along its orientation.
 * Horizontal bleed cancels 1rem of content padding; vertical bleed removes the dot's inset while keeping it inside.
 */
export const Timeline: FC<TimelineProps> = ({
  orientation = "vertical",
  color = "brand",
  showRailStubs = true,
  bleed,
  className,
  children,
  style,
  ...props
}) => {
  const timelineStyle: CSSProperties & { "--timeline-columns"?: string } = { ...style }

  if (orientation === "horizontal") {
    timelineStyle["--timeline-columns"] = getHorizontalTimelineColumns(children).join(" ")
  }

  return (
    <div
      data-slot="timeline"
      data-orientation={orientation}
      data-rail-stubs={showRailStubs}
      data-bleed={bleed}
      className={cn(
        "group/timeline grid w-full",
        timelineGridClassNames[orientation],
        timelineColorClassNames[color],
        bleed !== undefined && timelineBleedClassNames[orientation][bleed],
        className
      )}
      style={timelineStyle}
      {...props}
    >
      {children}
    </div>
  )
}

export type TimelineItemAlignment = "start" | "center" | "end"

export type TimelineItemProps = ComponentPropsWithoutRef<"div"> & {
  /**
   * Positions horizontal content and side-label blocks relative to the dot, preserving their internal layout.
   *
   * Defaults to `start`.
   */
  align?: TimelineItemAlignment
}

const timelineItemAlignmentClassNames: Record<TimelineItemAlignment, string> = {
  start: "[--timeline-dot-position:1.375rem]",
  center: "[--timeline-dot-position:50%]",
  end: "[--timeline-dot-position:calc(100%-1.375rem)]",
}

export const TimelineItem: FC<TimelineItemProps> = ({ align = "start", className, ...props }) => (
  <div
    data-slot="timeline-item"
    data-align={align}
    className={cn(timelineRowClassName, timelineItemAlignmentClassNames[align], className)}
    {...props}
  />
)

/**
 * Optional label to the left of the vertical rail or above the horizontal rail (typically a time or date).
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
      "group-data-[orientation=horizontal]/timeline:pt-0 group-data-[orientation=horizontal]/timeline:text-left",
      "group-data-[orientation=horizontal]/timeline:self-end group-data-[orientation=horizontal]/timeline:pr-6",
      "group-data-[orientation=horizontal]/timeline:pb-2 group-data-[orientation=horizontal]/timeline:pl-4",
      "group-data-[orientation=horizontal]/timeline:group-data-[align=center]/timeline-row:px-4",
      "group-data-[orientation=horizontal]/timeline:group-data-[align=center]/timeline-row:w-fit",
      "group-data-[orientation=horizontal]/timeline:group-data-[align=center]/timeline-row:justify-self-center",
      "group-data-[orientation=horizontal]/timeline:group-data-[align=end]/timeline-row:pl-6",
      "group-data-[orientation=horizontal]/timeline:group-data-[align=end]/timeline-row:pr-4",
      "group-data-[orientation=horizontal]/timeline:group-data-[align=end]/timeline-row:w-fit",
      "group-data-[orientation=horizontal]/timeline:group-data-[align=end]/timeline-row:justify-self-end",
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
 * instead. In horizontal timelines, the dot follows the item's `align` setting along with its labels and content.
 * Override with `className` if your content needs a different offset.
 */
export const TimelineDot: FC<ComponentPropsWithoutRef<"div">> = ({ className, children, ...props }) => (
  <div data-slot="timeline-dot" className={timelineRailClassName} {...props}>
    <TimelineRailLine />

    <span
      aria-hidden="true"
      className={cn(
        "absolute left-1/2 z-10 block size-3 -translate-x-1/2 rounded-full",
        "top-0.5 group-has-data-[slot=timeline-side-label]/timeline-row:top-1.5",
        "group-data-[orientation=horizontal]/timeline:left-(--timeline-dot-position)",
        "group-data-[orientation=horizontal]/timeline:top-1/2 group-data-[orientation=horizontal]/timeline:-translate-y-1/2",
        "group-data-[orientation=horizontal]/timeline:group-has-data-[slot=timeline-side-label]/timeline-row:top-1/2",
        "border-[3px] border-(--timeline-color) bg-white",
        className
      )}
    />

    {children}
  </div>
)

export const TimelineContent: FC<ComponentPropsWithoutRef<"div">> = ({ className, ...props }) => (
  <div
    data-slot="timeline-content"
    className={cn(
      "col-start-3 row-start-1 min-w-0 pb-6 pl-2 group-last/timeline-row:pb-0",
      "group-data-[orientation=horizontal]/timeline:col-start-1 group-data-[orientation=horizontal]/timeline:row-start-3",
      "group-data-[orientation=horizontal]/timeline:pt-2 group-data-[orientation=horizontal]/timeline:pr-6",
      "group-data-[orientation=horizontal]/timeline:pb-0 group-data-[orientation=horizontal]/timeline:pl-4",
      "group-data-[orientation=horizontal]/timeline:group-last/timeline-row:pr-0",
      "group-data-[orientation=horizontal]/timeline:group-data-[align=center]/timeline-row:w-fit",
      "group-data-[orientation=horizontal]/timeline:group-data-[align=center]/timeline-row:max-w-full",
      "group-data-[orientation=horizontal]/timeline:group-data-[align=center]/timeline-row:justify-self-center",
      "group-data-[orientation=horizontal]/timeline:group-data-[align=center]/timeline-row:px-4",
      "group-data-[orientation=horizontal]/timeline:group-data-[align=end]/timeline-row:w-fit",
      "group-data-[orientation=horizontal]/timeline:group-data-[align=end]/timeline-row:max-w-full",
      "group-data-[orientation=horizontal]/timeline:group-data-[align=end]/timeline-row:justify-self-end",
      "group-data-[orientation=horizontal]/timeline:group-data-[align=end]/timeline-row:pl-6",
      "group-data-[orientation=horizontal]/timeline:group-data-[align=end]/timeline-row:pr-4",
      className
    )}
    {...props}
  />
)

export type TimelineGroupHeaderPosition = "side" | "content" | "responsive"

export type TimelineGroupHeaderProps = ComponentPropsWithoutRef<"div"> & {
  position?: TimelineGroupHeaderPosition
}

const groupHeaderSideLabelClassName = cn(
  "col-start-1 pr-2 text-right",
  "group-data-[orientation=horizontal]/timeline:text-left",
  "group-data-[orientation=horizontal]/timeline:row-start-1 group-data-[orientation=horizontal]/timeline:pb-2"
)
const groupHeaderContentLabelClassName = cn(
  "col-start-3 pl-2 text-left",
  "group-data-[orientation=horizontal]/timeline:row-start-3 group-data-[orientation=horizontal]/timeline:pt-2",
  "group-data-[orientation=horizontal]/timeline:self-start"
)

const groupHeaderLabelPositionClassNames: Record<TimelineGroupHeaderPosition, string> = {
  side: groupHeaderSideLabelClassName,
  content: groupHeaderContentLabelClassName,
  responsive: cn(
    groupHeaderContentLabelClassName,
    "sm:col-start-1 sm:pr-2 sm:pl-0 sm:text-right",
    "sm:group-data-[orientation=horizontal]/timeline:row-start-1 sm:group-data-[orientation=horizontal]/timeline:pb-2",
    "sm:group-data-[orientation=horizontal]/timeline:pt-0 sm:group-data-[orientation=horizontal]/timeline:text-left",
    "sm:group-data-[orientation=horizontal]/timeline:self-end"
  ),
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
 *
 * In horizontal timelines, the header uses a compact column sized to its label, beside the first item in its group.
 * `side` places its label above the rail and `content` below it; `responsive` switches at the same breakpoint.
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
          "group-data-[orientation=horizontal]/timeline:pt-0 group-data-[orientation=horizontal]/timeline:pb-0",
          "group-data-[orientation=horizontal]/timeline:col-start-1 group-data-[orientation=horizontal]/timeline:pr-2",
          "group-data-[orientation=horizontal]/timeline:pl-4",
          "group-data-[orientation=horizontal]/timeline:self-end",
          "whitespace-nowrap font-semibold text-sm",
          labelPositionClassName
        )}
      >
        {children}
      </div>

      <div className={timelineRailClassName}>
        <TimelineRailLine />
      </div>
    </div>
  )
}
