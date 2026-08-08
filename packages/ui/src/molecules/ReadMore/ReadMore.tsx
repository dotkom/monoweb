"use client"

import { IconChevronDown } from "@tabler/icons-react"
import { type ReactNode, useLayoutEffect, useRef, useState } from "react"
import { Button } from "../../atoms/Button/Button"
import { cn } from "../../utils"

const DEFAULT_LINE_HEIGHT = 28

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
  const [collapsedMaxHeight, setCollapsedMaxHeight] = useState(maxLines ? DEFAULT_LINE_HEIGHT * maxLines : 0)
  const [expandedMaxHeight, setExpandedMaxHeight] = useState(0)
  const [previousContainerHeight, setPreviousContainerHeight] = useState<number | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const contentElementRef = useRef<HTMLDivElement>(null)

  const measureHeights = () => {
    const contentElement = contentElementRef.current

    if (!maxLines || !contentElement) {
      return
    }

    // The content is usually a single child (e.g. a prose element) which carries the
    // typography, so prefer its line height over the wrapper's inherited one
    const measuredElement = contentElement.firstElementChild ?? contentElement
    const computedStyles = getComputedStyle(measuredElement)

    const lineHeight = Number.parseFloat(computedStyles.lineHeight || "0") || DEFAULT_LINE_HEIGHT
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: should not have containerRef as dependency
  useLayoutEffect(() => {
    if (isExpanded || previousContainerHeight === null || !containerRef.current) {
      return
    }

    const heightDifference = previousContainerHeight - collapsedMaxHeight

    if (heightDifference > 0) {
      window.scrollBy({ top: -heightDifference })
    }

    setPreviousContainerHeight(null)
  }, [isExpanded, previousContainerHeight, setPreviousContainerHeight])

  const handleToggleExpandCollapse = () => {
    if (isExpanded && containerRef.current) {
      setPreviousContainerHeight(containerRef.current.getBoundingClientRect().height)
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
