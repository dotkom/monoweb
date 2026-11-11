"use client"

import { Button } from "./button"
import { Popover, PopoverContent, PopoverTrigger } from "../atoms/Popover/Popover"
import { cn } from "../lib/utils"
import { type ElementType, type ReactNode, useEffect, useRef, useState } from "react"
import { IconQuestionMark } from "@tabler/icons-react"

export interface CollapsibleListItem {
  id: string
  text: string
  icon?: ReactNode
  href?: string
}

export interface CollapsibleItemListProps {
  items: CollapsibleListItem[]
  label: string
  emptyContent?: ReactNode
  maxVisibleItems?: number
  linkComponent?: ElementType
  formatRemainingCount?: (count: number) => string
  className?: string
}

export function CollapsibleItemList({
  items,
  label,
  emptyContent = null,
  maxVisibleItems = 3,
  linkComponent = "a",
  formatRemainingCount = (count) => `og ${count} flere`,
  className,
}: CollapsibleItemListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const expandedListRef = useRef<HTMLDivElement>(null)
  const [isCollapsed, setIsCollapsed] = useState(true)

  const hasMultipleItems = items.length > 1

  useEffect(() => {
    if (hasMultipleItems === false) {
      return
    }

    const container = containerRef.current
    const expandedList = expandedListRef.current

    if (container === null || expandedList === null) {
      return
    }

    const updateLayout = () => {
      const availableWidth = container.getBoundingClientRect().width
      const expandedWidth = expandedList.getBoundingClientRect().width

      setIsCollapsed(expandedWidth > availableWidth)
    }

    const observer = new ResizeObserver(updateLayout)

    observer.observe(container)
    observer.observe(expandedList)

    updateLayout()

    return () => {
      observer.disconnect()
    }
  }, [hasMultipleItems])

  const firstItem = items[0]

  if (firstItem === undefined) {
    return <div className={cn("min-w-0 flex-1 text-muted-foreground", className)}>{emptyContent}</div>
  }

  const firstItemName = firstItem.text

  const remainingCount = items.length - 1
  const shouldCollapse = items.length > maxVisibleItems || (isCollapsed && remainingCount > 0)
  const hasTwoItems = items.length === 2

  return (
    <div ref={containerRef} className={cn("relative min-w-0 flex-1 basis-48", className)}>
      {/* We measure the full row independently so collapsing cannot change the measured width */}
      {hasMultipleItems && (
        <div className="pointer-events-none invisible absolute inset-0 overflow-hidden" aria-hidden inert>
          <div ref={expandedListRef} className="flex w-max items-center gap-6 whitespace-nowrap">
            {items.map((item) => (
              <ListItem key={item.id} item={item} linkComponent={linkComponent} />
            ))}
          </div>
        </div>
      )}

      {shouldCollapse ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              aria-label={`${firstItemName} ${formatRemainingCount(remainingCount)}`}
              className={cn(
                "h-9.5 max-w-full justify-start rounded-l-lg rounded-r-[1.1875rem] py-1 pl-1.5 pr-3.5 text-base font-normal",
                hasTwoItems ? "gap-1.5 rounded-l-[1.1875rem]" : "gap-2"
              )}
            >
              <ItemIcons items={items} />
              <span className="inline-flex min-w-0 items-center text-left">
                <span className="min-w-0 truncate">{firstItemName}</span>
                <span className="shrink-0 whitespace-pre">{` ${formatRemainingCount(remainingCount)}`}</span>
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            aria-label={label}
            className="max-h-96 w-80 max-w-[calc(100vw-2rem)] gap-2 p-2 rounded-2xl overflow-x-hidden overflow-y-auto text-base"
          >
            {items.map((item) => (
              <ListItem key={item.id} item={item} linkComponent={linkComponent} className="ml-0 mr-0 rounded-lg" />
            ))}
          </PopoverContent>
        </Popover>
      ) : (
        <div className="flex min-w-0 items-center gap-6">
          {items.map((item) => (
            <ListItem key={item.id} item={item} linkComponent={linkComponent} />
          ))}
        </div>
      )}
    </div>
  )
}

function ListItem({
  item,
  linkComponent: LinkComponent,
  className,
}: {
  item: CollapsibleListItem
  linkComponent: ElementType
  className?: string
}) {
  const Component = item.href === undefined ? "span" : LinkComponent

  return (
    <Component
      href={item.href}
      className={cn(
        "flex min-w-0 items-center gap-1.5 rounded-full border border-transparent py-1 pl-1 pr-3.5 -ml-1 -mr-3.5",
        item.href !== undefined &&
          "transition-colors hover:bg-gray-50 hover:border-gray-300 dark:hover:bg-white/5 dark:hover:border-stone-700",
        className
      )}
    >
      <ItemIcon item={item} />
      <span className="min-w-0 truncate">{item.text}</span>
    </Component>
  )
}

function ItemIcon({
  item,
  variant = "single",
}: {
  item: CollapsibleListItem
  variant?: "single" | "overlap" | "grid"
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden bg-white font-body leading-none text-stone-900 [&>*]:size-full [&>*]:object-contain [&>svg]:size-full!",
        variant === "single" && "size-7 rounded-full text-xs",
        variant === "overlap" && "relative size-6 rounded-full text-xs ring-3 ring-background",
        variant === "grid" && "size-full rounded-full text-[9px]"
      )}
    >
      {item.icon ?? (
        <span className="flex items-center justify-center bg-gray-200 dark:bg-stone-600">
          <IconQuestionMark className="size-3/4 text-muted-foreground" />
        </span>
      )}
    </span>
  )
}

function ItemIcons({ items }: { items: CollapsibleListItem[] }) {
  const hasTwoItems = items.length === 2
  const hasThreeItems = items.length === 3

  const iconVariant = hasTwoItems ? "overlap" : "grid"

  return (
    <span
      aria-hidden
      className={cn(
        "shrink-0",
        hasTwoItems
          ? "isolate flex h-7.5 w-11.5 items-center -space-x-2 px-0.75 [&>:first-child]:z-10"
          : "grid size-7 grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden rounded-md",
        hasThreeItems && "grid-cols-4 [&>*]:col-span-2 [&>:first-child]:col-start-2"
      )}
    >
      {items.slice(0, 4).map((item) => (
        <ItemIcon key={item.id} item={item} variant={iconVariant} />
      ))}
    </span>
  )
}
