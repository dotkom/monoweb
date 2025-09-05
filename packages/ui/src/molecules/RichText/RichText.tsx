"use client"

import DOMPurify from "isomorphic-dompurify"
import { useLayoutEffect, useRef, useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../atoms/Collapsible/Collapsible"
import { Text } from "../../atoms/Typography/Text"
import { cn } from "../../utils"

interface RichTextProps {
  content: string
  className?: string
  lineClamp?: `line-clamp-${number}`
  readMoreText?: string
  readLessText?: string
  hideToggleButton?: boolean
  toggleButtonClassName?: string
}

export function RichText({
  content,
  className,
  lineClamp,
  readMoreText = "Vis mer...",
  readLessText = "Vis mindre",
  hideToggleButton = false,
  toggleButtonClassName,
}: RichTextProps) {
  const [open, setOpen] = useState(false)
  const [isOverflowed, setIsOverflowed] = useState(false)
  const [previousHeight, setPreviousHeight] = useState<number | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (open || previousHeight === null || !containerRef.current) {
      return
    }

    const newHeight = containerRef.current.getBoundingClientRect().height
    const delta = previousHeight - newHeight

    if (delta > 0) {
      window.scrollBy({ top: -delta })
    }

    setPreviousHeight(0)
  }, [open, previousHeight])

  // biome-ignore lint/correctness/useExhaustiveDependencies: This uses these dependencies indirectly
  useLayoutEffect(() => {
    const element = contentRef.current

    if (element) {
      setIsOverflowed(element.scrollHeight > element.clientHeight)
    }
  }, [content, lineClamp])

  const handleToggle = () => {
    if (open && containerRef.current) {
      setPreviousHeight(containerRef.current.getBoundingClientRect().height)
    }

    setOpen(!open)
  }

  const sanitizedContent = DOMPurify.sanitize(content)

  const richText = (
    <Text
      element="div"
      ref={contentRef}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      className={cn(
        "prose dark:prose-invert overflow-hidden",
        !open && lineClamp,
        "prose-a:text-blue-600 dark:prose-a:text-blue-300",
        "[&_ul>li::marker]:text-black dark:[&_ul>li::marker]:text-white",
        "[&_ol>li::marker]:text-black dark:[&_ol>li::marker]:text-white",
        "prose-code:px-1 prose-code:py-0.5 prose-code:bg-black/10 prose-code:dark:bg-white/10 prose-code:rounded-md",
        "[&_li>p]:my-0",
        // Selects empty <p> tags and gives them a height to give space to empty newlines
        "[&_p:empty]:m-0 [&_p:empty]:before:content-[''] [&_p:empty]:before:block [&_p:empty]:before:h-3",
        className
      )}
    />
  )

  if (!isOverflowed || hideToggleButton) return richText

  return (
    <Collapsible ref={containerRef} open={open} onOpenChange={setOpen}>
      <CollapsibleContent forceMount>{richText}</CollapsibleContent>
      <CollapsibleTrigger
        asChild
        onClick={handleToggle}
        className={cn(
          "mt-2 transition-colors text-gray-500 dark:text-stone-400 hover:text-black dark:hover:text-white [font-size:inherit]",
          toggleButtonClassName
        )}
      >
        <Text element="button">{open ? readLessText : readMoreText}</Text>
      </CollapsibleTrigger>
    </Collapsible>
  )
}
