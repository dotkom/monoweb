"use client"

import { IconChevronDown } from "@tabler/icons-react"
import { type ReactNode, useLayoutEffect, useRef, useState } from "react"
import { Button } from "../../atoms/Button/Button"
import { cn } from "../../utils"

// This component is black magic and I have no idea what is going on, but it works surprisingly well

// ReadMore shows a preview of long content with a toggle to expand or collapse it. When it closes, we scroll manually
// as the content shrinks, to keep the closing from feeling abrupt, and disorienting the user.

// There is a lot of computation going on here, but it's mostly just element height and stuff. It should be cheap, even
// though it looks expensive.

const DEFAULT_LINE_HEIGHT_PX = 28

function findVerticalScrollContainer(element: HTMLElement) {
  let ancestor = element.parentElement

  while (ancestor !== null) {
    const { overflowY } = getComputedStyle(ancestor)

    const canOverflow = overflowY === "auto" || overflowY === "scroll"
    const isOverflowing = ancestor.scrollHeight > ancestor.clientHeight

    // We check the actual height because a wrapper that only scrolls horizontally can still have `overflow-y: auto`
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
  stickyToggle?: boolean
  className?: string
  toggleButtonClassName?: string
}

export function ReadMore({
  children,
  maxLines = 3,
  readMoreText = "Vis mer",
  readLessText = "Vis mindre",
  hideToggleButton = false,
  stickyToggle = true,
  className,
  toggleButtonClassName,
}: ReadMoreProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const [collapsedMaxHeight, setCollapsedMaxHeight] = useState(maxLines ? DEFAULT_LINE_HEIGHT_PX * maxLines : 0)
  const [expandedMaxHeight, setExpandedMaxHeight] = useState(0)
  const [collapseScroll, setCollapseScroll] = useState<{
    previousContentHeight: number
    scrollContainer: HTMLElement | null
    previousScrollTop: number
    scrollDistance: number
  } | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const contentElementRef = useRef<HTMLDivElement>(null)
  const toggleRowRef = useRef<HTMLDivElement>(null)

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
    const contentElement = contentElementRef.current

    if (isExpanded || collapseScroll === null || contentElement === null) {
      return
    }

    const { previousContentHeight, scrollContainer, previousScrollTop, scrollDistance } = collapseScroll
    const scrollTarget = scrollContainer ?? window
    const totalHeightChange = previousContentHeight - collapsedMaxHeight
    const heightTransition = contentElement
      .getAnimations()
      .find((animation) => animation instanceof CSSTransition && animation.transitionProperty === "max-height")

    const syncScroll = () => {
      if (scrollDistance <= 0 || totalHeightChange <= 0) {
        return
      }

      const currentScrollTop = scrollContainer?.scrollTop ?? window.scrollY

      // We use the height the browser has rendered to work out how far the close has progressed. This makes scrolling
      // follow the same easing as the height transition, even if we only need to scroll part of the height removed
      const heightChange = previousContentHeight - contentElement.getBoundingClientRect().height
      const progress = Math.max(0, Math.min(1, heightChange / totalHeightChange))
      const nextScrollTop = previousScrollTop - scrollDistance * progress

      if (progress > 0 && Math.abs(nextScrollTop - currentScrollTop) > 0.5) {
        scrollTarget.scrollTo({ top: nextScrollTop, behavior: "instant" })
      }
    }

    syncScroll()

    // With reduced motion the height changes immediately, so the first scroll update is enough
    if (heightTransition === undefined) {
      setCollapseScroll(null)

      return
    }

    const observer = new ResizeObserver(syncScroll)
    observer.observe(contentElement)

    let isActive = true

    const finishCollapse = () => {
      if (isActive) {
        syncScroll()
        setCollapseScroll(null)
      }
    }

    void heightTransition.finished.then(finishCollapse, finishCollapse)

    return () => {
      isActive = false
      observer.disconnect()
    }
  }, [collapseScroll, collapsedMaxHeight, isExpanded])

  const handleToggleExpandCollapse = () => {
    const container = containerRef.current
    const contentElement = contentElementRef.current
    const toggleRow = toggleRowRef.current

    if (isExpanded && container !== null && contentElement !== null && toggleRow !== null) {
      // We find the scroll container before closing, since the shorter content may no longer overflow the drawer
      const scrollContainer = findVerticalScrollContainer(container)

      const viewportTop = scrollContainer?.getBoundingClientRect().top ?? 0
      const contentBounds = contentElement.getBoundingClientRect()
      const collapsedContentBottom = contentBounds.top + collapsedMaxHeight

      const distanceToToggle = toggleRow.getBoundingClientRect().top - collapsedContentBottom
      const distanceToContentStart = viewportTop - contentBounds.top

      // We scroll just enough to keep the toggle in view, and stop at the start of the description
      const scrollDistance = Math.max(0, Math.min(distanceToToggle, distanceToContentStart))

      setCollapseScroll({
        previousContentHeight: contentBounds.height,
        scrollContainer,
        previousScrollTop: scrollContainer?.scrollTop ?? window.scrollY,
        scrollDistance,
      })
    } else {
      setCollapseScroll(null)
    }

    setIsExpanded((previous) => !previous)
  }

  const content = (
    <div
      ref={contentElementRef}
      className={cn(
        "overflow-hidden transition-[max-height] ease-out motion-reduce:transition-none",
        isExpanded ? "duration-200" : "duration-300",
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

  // We keep the toggle sticky through the close so it doesn't jump to the end while the content is still shrinking
  const isToggleSticky = stickyToggle && (isExpanded || collapseScroll !== null)

  return (
    <div ref={containerRef}>
      {content}
      <div
        ref={toggleRowRef}
        className={cn(
          "flex justify-center transition-[margin-top] ease-out motion-reduce:transition-none",
          isExpanded ? "mt-3 duration-200" : "mt-1 duration-300",
          isToggleSticky && "pointer-events-none sticky bottom-3 z-10"
        )}
      >
        <div className="rounded-full bg-background">
          <Button
            aria-expanded={isExpanded}
            iconRight={
              <IconChevronDown className={cn("transition-transform duration-200", isExpanded && "rotate-180")} />
            }
            onClick={handleToggleExpandCollapse}
            type="button"
            variant="outline"
            className={cn(
              "pointer-events-auto rounded-full max-md:h-10 max-md:px-3.5 max-md:text-base",
              toggleButtonClassName
            )}
          >
            {isExpanded ? readLessText : readMoreText}
          </Button>
        </div>
      </div>
    </div>
  )
}
