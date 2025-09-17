"use client"

import DOMPurify from "isomorphic-dompurify"
import { useLayoutEffect, useRef, useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../atoms/Collapsible/Collapsible"
import { Text } from "../../atoms/Typography/Text"
import { cn } from "../../utils"

const DEFAULT_LINE_HEIGHT = 28

interface RichTextProps {
  content: string
  className?: string
  maxLines?: number
  readMoreText?: string
  readLessText?: string
  hideToggleButton?: boolean
  toggleButtonClassName?: string
}

export function RichText({
  content,
  className,
  maxLines,
  readMoreText = "Vis mer...",
  readLessText = "Vis mindre",
  hideToggleButton = false,
  toggleButtonClassName,
}: RichTextProps) {
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

    const computedStyles = getComputedStyle(contentElement)

    const lineHeight = Number.parseFloat(computedStyles.lineHeight || "0") || DEFAULT_LINE_HEIGHT
    const verticalPadding =
      Number.parseFloat(computedStyles.paddingTop || "0") + Number.parseFloat(computedStyles.paddingBottom || "0")

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
  }, [content, maxLines])

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

  const sanitizedContent = DOMPurify.sanitize(content)

  const richTextContent = (
    <Text
      element="div"
      ref={contentElementRef}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      className={cn(
        "prose dark:prose-invert overflow-hidden",
        "prose-a:text-blue-600 dark:prose-a:text-blue-300",
        "[&_ul>li::marker]:text-black dark:[&_ul>li::marker]:text-white",
        "[&_ol>li::marker]:text-black dark:[&_ol>li::marker]:text-white",
        "prose-code:px-1 prose-code:py-0.5 prose-code:bg-black/10 prose-code:dark:bg-white/10 prose-code:rounded-md",
        "[&_li>p]:my-0",
        "[&_p:empty]:m-0 [&_p:empty]:before:content-[''] [&_p:empty]:before:block [&_p:empty]:before:h-3",
        className
      )}
      style={{
        maxHeight: isExpanded ? expandedMaxHeight || undefined : collapsedMaxHeight || undefined,
        transition: "max-height 200ms ease",
        WebkitMaskImage:
          !isExpanded && isOverflowing ? "linear-gradient(180deg, #000 75%, transparent 100%)" : undefined,
        maskImage: !isExpanded && isOverflowing ? "linear-gradient(180deg, #000 75%, transparent 100%)" : undefined,
      }}
    />
  )

  if (!isOverflowing || hideToggleButton) {
    return richTextContent
  }

  return (
    <Collapsible ref={containerRef} open={isExpanded} onOpenChange={setIsExpanded}>
      <CollapsibleContent forceMount>{richTextContent}</CollapsibleContent>
      <CollapsibleTrigger
        asChild
        onClick={handleToggleExpandCollapse}
        className={cn(
          "transition-colors text-gray-500 dark:text-stone-400 hover:text-black dark:hover:text-white [font-size:inherit]",
          isExpanded && "mt-2",
          toggleButtonClassName
        )}
      >
        <Text element="button">{isExpanded ? readLessText : readMoreText}</Text>
      </CollapsibleTrigger>
    </Collapsible>
  )
}
