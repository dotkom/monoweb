"use client"

import { IconChevronDown } from "@tabler/icons-react"
import { type ReactNode, useLayoutEffect, useRef, useState } from "react"
import { Button } from "../../atoms/Button/Button"
import { cn } from "../../utils"

const DEFAULT_LINE_HEIGHT_PX = 28

function findVerticalScrollContainer(element: HTMLElement) {
  let ancestor = element.parentElement

  while (ancestor !== null) {
    const { overflowY } = getComputedStyle(ancestor)

    const canOverflow = overflowY === "auto" || overflowY === "scroll"
    const isOverflowing = ancestor.scrollHeight > ancestor.clientHeight

    if (canOverflow && isOverflowing) {
      return ancestor
    }

    ancestor = ancestor.parentElement
  }

  return null
}

interface ReadMoreProps {
  children: ReactNode
  /** Number of lines to show when collapsed */
  maxLines?: number
  readMoreText?: string
  readLessText?: string
  /** Clamp the content, but never render the expand/collapse button */
  hideToggleButton?: boolean
  className?: string
  toggleButtonClassName?: string
}

export function ReadMore({
  children,
  maxLines = 3,
  readMoreText = "Vis mer",
  readLessText = "Vis mindre",
  hideToggleButton = false,
  className,
  toggleButtonClassName,
}: ReadMoreProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const [collapsedMaxHeight, setCollapsedMaxHeight] = useState(maxLines ? DEFAULT_LINE_HEIGHT_PX * maxLines : 0)
  const [expandedMaxHeight, setExpandedMaxHeight] = useState(0)
  const [collapseScroll, setCollapseScroll] = useState<{
    previousContainerHeight: number
    scrollContainer: HTMLElement | null
  } | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const contentElementRef = useRef<HTMLDivElement>(null)

  const measureHeights = () => {
    const contentElement = contentElementRef.current

    if (maxLines === undefined || contentElement === null) {
      return
    }

    // The content is usually a single child (e.g. a prose element) which carries the
    // typography, so prefer its line height over the wrapper's inherited one
    const measuredElement = contentElement.firstElementChild ?? contentElement
    const computedStyles = getComputedStyle(measuredElement)

    const lineHeight = Number.parseFloat(computedStyles.lineHeight || "0") || DEFAULT_LINE_HEIGHT_PX
    const wrapperStyles = getComputedStyle(contentElement)
    const verticalPadding =
      Number.parseFloat(wrapperStyles.paddingTop || "0") + Number.parseFloat(wrapperStyles.paddingBottom || "0")

    const collapsedHeight = Math.ceil(lineHeight * maxLines + verticalPadding)

    let expandedHeight = contentElement.scrollHeight

    if (contentElement.lastElementChild) {
      const lastChildStyles = getComputedStyle(contentElement.lastElementChild)
      const lastChildMarginBottom = Number.parseFloat(lastChildStyles.marginBottom || "0")
      expandedHeight += lastChildMarginBottom
    }

    setCollapsedMaxHeight(collapsedHeight)
    setExpandedMaxHeight(expandedHeight)
    setIsOverflowing(expandedHeight > collapsedHeight + 1)
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: should not have contentElementRef as dependency
  useLayoutEffect(() => {
    measureHeights()

    const resizeObserver = new ResizeObserver(() => measureHeights())

    if (contentElementRef.current) {
      resizeObserver.observe(contentElementRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [children, maxLines])

  useLayoutEffect(() => {
    if (isExpanded || collapseScroll === null) {
      return
    }

    const { previousContainerHeight, scrollContainer } = collapseScroll
    const heightDifference = previousContainerHeight - collapsedMaxHeight

    if (heightDifference > 0) {
      const scrollTarget = scrollContainer ?? window

      scrollTarget.scrollBy({ top: -heightDifference })
    }

    setCollapseScroll(null)
  }, [collapseScroll, collapsedMaxHeight, isExpanded])

  const handleToggleExpandCollapse = () => {
    const container = containerRef.current

    if (isExpanded && container !== null) {
      setCollapseScroll({
        previousContainerHeight: container.getBoundingClientRect().height,
        scrollContainer: findVerticalScrollContainer(container),
      })
    }

    setIsExpanded((previous) => !previous)
  }

  const content = (
    <div
      ref={contentElementRef}
      className={cn(
        "overflow-hidden transition-[max-height] duration-200 ease-out motion-reduce:transition-none",
        className
      )}
      style={{
        maxHeight: isExpanded ? expandedMaxHeight || undefined : collapsedMaxHeight || undefined,
        WebkitMaskImage:
          !isExpanded && isOverflowing ? "linear-gradient(180deg, #000 75%, transparent 100%)" : undefined,
        maskImage: !isExpanded && isOverflowing ? "linear-gradient(180deg, #000 75%, transparent 100%)" : undefined,
      }}
    >
      {children}
    </div>
  )

  if (!maxLines || !isOverflowing || hideToggleButton) {
    return content
  }

  return (
    <div ref={containerRef}>
      {content}
      <div className="mt-3 flex justify-center">
        <Button
          aria-expanded={isExpanded}
          className={toggleButtonClassName}
          iconRight={
            <IconChevronDown className={cn("transition-transform duration-200", isExpanded && "rotate-180")} />
          }
          onClick={handleToggleExpandCollapse}
          size="lg"
          type="button"
          variant="outline"
        >
          {isExpanded ? readLessText : readMoreText}
        </Button>
      </div>
    </div>
  )
}
